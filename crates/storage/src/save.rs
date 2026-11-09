use crate::{hash, io_fault};
use contracts::{Fault, FileSnapshot, Result, SaveReceipt};
use std::{
    fs::{self, OpenOptions},
    io::Write,
    path::Path,
};
use uuid::Uuid;

fn backup(directory: &Path, bytes: &[u8], label: &str) -> Result<String> {
    fs::create_dir_all(directory).map_err(io_fault)?;
    let path = directory.join(format!("{}-{label}.bak", Uuid::new_v4()));
    let mut file = OpenOptions::new()
        .write(true)
        .create_new(true)
        .open(&path)
        .map_err(io_fault)?;
    file.write_all(bytes).map_err(io_fault)?;
    file.sync_all().map_err(io_fault)?;
    if fs::read(&path).map_err(io_fault)? != bytes {
        return Err(Fault::new("storage.backup_verification"));
    }
    Ok(path.to_string_lossy().into_owned())
}

fn unchanged(source: &FileSnapshot) -> Result<()> {
    if let Some(path) = &source.path {
        if hash(&fs::read(path).map_err(io_fault)?) != source.hash {
            return Err(Fault::new("storage.external_change"));
        }
    }
    Ok(())
}

pub fn write(source: &FileSnapshot, bytes: &[u8], target: &Path) -> Result<SaveReceipt> {
    unchanged(source)?;
    let parent = target
        .parent()
        .filter(|p| !p.as_os_str().is_empty())
        .ok_or_else(|| Fault::new("file.invalid_path"))?;
    let name = target
        .file_name()
        .ok_or_else(|| Fault::new("file.invalid_name"))?;
    let backup_dir = parent.join(format!(".{}.war2-backups", name.to_string_lossy()));
    // Back up both the editing source and an existing Save As destination.
    let source_backup = backup(&backup_dir, &source.bytes, "source")?;
    let existing = if target.exists() {
        Some(fs::read(target).map_err(io_fault)?)
    } else {
        None
    };
    if let Some(original) = &existing {
        if original != &source.bytes {
            backup(&backup_dir, original, "destination")?;
        }
    }
    let mut temporary = tempfile::NamedTempFile::new_in(parent).map_err(io_fault)?;
    temporary.write_all(bytes).map_err(io_fault)?;
    temporary.as_file().sync_all().map_err(io_fault)?;
    if fs::read(temporary.path()).map_err(io_fault)? != bytes {
        return Err(Fault::new("storage.write_verification"));
    }
    unchanged(source)?;
    let now = if target.exists() {
        Some(fs::read(target).map_err(io_fault)?)
    } else {
        None
    };
    if existing != now {
        return Err(Fault::new("storage.external_change"));
    }
    // tempfile's platform implementation replaces an existing destination on Windows.
    temporary
        .persist(target)
        .map_err(io_fault)?
        .sync_all()
        .map_err(io_fault)?;
    if hash(&fs::read(target).map_err(io_fault)?) != hash(bytes) {
        return Err(Fault::new("storage.final_verification").detail(&source_backup));
    }
    Ok(SaveReceipt {
        backup: source_backup,
        hash: hash(bytes),
        path: target.to_string_lossy().into_owned(),
        warnings: Vec::new(),
    })
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::LocalStorage;

    #[test]
    fn backup_is_exact_and_external_changes_prevent_overwrite() {
        let dir = tempfile::tempdir().unwrap();
        let path = dir.path().join("sample.w2tr");
        fs::write(&path, [5, 0, 1, 254, 255]).unwrap();
        let source = LocalStorage::new(dir.path().join("recovery"))
            .read_path(&path)
            .unwrap();
        let receipt = write(&source, &[5, 0, 2, 254, 255], &path).unwrap();
        assert_eq!(fs::read(receipt.backup).unwrap(), source.bytes);
        assert_eq!(fs::read(&path).unwrap(), [5, 0, 2, 254, 255]);
        assert_eq!(
            write(&source, &[0], &path).unwrap_err().code,
            "storage.external_change"
        );
        assert_eq!(fs::read(&path).unwrap(), [5, 0, 2, 254, 255]);
    }

    #[test]
    fn backup_failure_leaves_original_untouched() {
        let dir = tempfile::tempdir().unwrap();
        let path = dir.path().join("sample.w2tr");
        fs::write(&path, [254, 255]).unwrap();
        fs::write(dir.path().join(".sample.w2tr.war2-backups"), b"blocked").unwrap();
        let source = LocalStorage::new(dir.path().join("recovery"))
            .read_path(&path)
            .unwrap();
        assert!(write(&source, &[254, 237], &path).is_err());
        assert_eq!(fs::read(path).unwrap(), [254, 255]);
    }
}
