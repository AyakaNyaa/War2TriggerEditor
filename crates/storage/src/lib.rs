//! File operations API. The only functional module allowed to touch user files.
mod backups;
mod recovery;
mod save;
use contracts::BackupEntry;
use contracts::{
    Fault, FileSnapshot, RecoveryEntry, RecoveryState, Result, SaveReceipt, StorageApi,
};
use sha2::{Digest, Sha256};
use std::{
    fs,
    path::{Path, PathBuf},
};

pub struct LocalStorage {
    recovery_directory: PathBuf,
}

pub(crate) fn hash(bytes: &[u8]) -> String {
    format!("{:x}", Sha256::digest(bytes))
}

pub(crate) fn io_fault(error: impl ToString) -> Fault {
    Fault::new("storage.io").detail(error)
}

impl LocalStorage {
    pub fn new(recovery_directory: PathBuf) -> Self {
        Self { recovery_directory }
    }
    pub fn read_path(&self, path: &Path) -> Result<FileSnapshot> {
        let metadata = fs::metadata(path).map_err(io_fault)?;
        if metadata.len() > 16 * 1024 * 1024 {
            return Err(Fault::new("file.too_large"));
        }
        let bytes = fs::read(path).map_err(io_fault)?;
        let name = path
            .file_name()
            .ok_or_else(|| Fault::new("file.invalid_name"))?
            .to_string_lossy()
            .into_owned();
        Ok(FileSnapshot {
            hash: hash(&bytes),
            bytes,
            name,
            path: Some(path.to_path_buf()),
        })
    }
}

impl StorageApi for LocalStorage {
    fn select_open(&self) -> Result<FileSnapshot> {
        let path = rfd::FileDialog::new()
            .add_filter("War2", &["pud", "w2tr"])
            .pick_file()
            .ok_or_else(|| Fault::new("dialog.cancelled"))?;
        self.read_path(&path)
    }

    fn import(&self, name: &str, bytes: &[u8]) -> Result<FileSnapshot> {
        if bytes.len() > 16 * 1024 * 1024 {
            return Err(Fault::new("file.too_large"));
        }
        let name = Path::new(name)
            .file_name()
            .ok_or_else(|| Fault::new("file.invalid_name"))?
            .to_string_lossy()
            .into_owned();
        Ok(FileSnapshot {
            name,
            path: None,
            bytes: bytes.to_vec(),
            hash: hash(bytes),
        })
    }

    fn save(&self, source: &FileSnapshot, bytes: &[u8], save_as: bool) -> Result<SaveReceipt> {
        let mut path = if !save_as && source.path.is_some() {
            source.path.clone().unwrap()
        } else {
            rfd::FileDialog::new()
                .set_file_name(&source.name)
                .save_file()
                .ok_or_else(|| Fault::new("dialog.cancelled"))?
        };
        let extension = Path::new(&source.name)
            .extension()
            .and_then(|s| s.to_str())
            .ok_or_else(|| Fault::new("file.unsupported_type"))?;
        if path.extension().is_none() {
            path.set_extension(extension);
        }
        if !path
            .extension()
            .and_then(|s| s.to_str())
            .is_some_and(|s| s.eq_ignore_ascii_case(extension))
        {
            return Err(Fault::new("file.wrong_extension"));
        }
        save::write(source, bytes, &path)
    }

    fn checkpoint(&self, id: &str, state: &RecoveryState) -> Result<()> {
        recovery::write(&self.recovery_directory, id, state)
    }
    fn recoveries(&self) -> Result<Vec<RecoveryEntry>> {
        recovery::list(&self.recovery_directory)
    }
    fn recover(&self, id: &str) -> Result<RecoveryState> {
        recovery::read(&self.recovery_directory, id)
    }
    fn clear_checkpoint(&self, id: &str) -> Result<()> {
        recovery::clear(&self.recovery_directory, id)
    }
    fn backups(&self, source: &FileSnapshot) -> Result<Vec<BackupEntry>> {
        backups::list(source)
    }
    fn read_backup(&self, source: &FileSnapshot, id: &str) -> Result<Vec<u8>> {
        backups::read(source, id)
    }
}
