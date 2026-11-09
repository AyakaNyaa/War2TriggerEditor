use crate::io_fault;
use contracts::{BackupEntry, Fault, FileSnapshot, Result};
use std::{fs, path::PathBuf, time::UNIX_EPOCH};

pub fn directory(source: &FileSnapshot) -> Result<PathBuf> {
    let path = source
        .path
        .as_ref()
        .ok_or_else(|| Fault::new("storage.no_saved_path"))?;
    let name = path
        .file_name()
        .ok_or_else(|| Fault::new("file.invalid_name"))?;
    Ok(path
        .parent()
        .ok_or_else(|| Fault::new("file.invalid_path"))?
        .join(format!(".{}.war2-backups", name.to_string_lossy())))
}

fn validate_id(id: &str) -> Result<()> {
    if id.len() < 36
        || !id.is_ascii()
        || uuid::Uuid::parse_str(&id[..36]).is_err()
        || !matches!(&id[36..], "-source.bak" | "-destination.bak")
    {
        return Err(Fault::new("storage.invalid_backup"));
    }
    Ok(())
}

pub fn list(source: &FileSnapshot) -> Result<Vec<BackupEntry>> {
    if source.path.is_none() {
        return Ok(Vec::new());
    }
    let directory = directory(source)?;
    if !directory.exists() {
        return Ok(Vec::new());
    }
    let mut entries = Vec::new();
    for entry in fs::read_dir(directory).map_err(io_fault)? {
        let entry = entry.map_err(io_fault)?;
        let id = entry.file_name().to_string_lossy().into_owned();
        if validate_id(&id).is_err() {
            continue;
        }
        let metadata = entry.metadata().map_err(io_fault)?;
        let created_unix = metadata
            .modified()
            .map_err(io_fault)?
            .duration_since(UNIX_EPOCH)
            .map_err(io_fault)?
            .as_secs();
        entries.push(BackupEntry {
            id,
            size: metadata.len(),
            created_unix,
        });
    }
    entries.sort_by_key(|entry| std::cmp::Reverse(entry.created_unix));
    Ok(entries)
}

pub fn read(source: &FileSnapshot, id: &str) -> Result<Vec<u8>> {
    validate_id(id)?;
    let directory = directory(source)?.canonicalize().map_err(io_fault)?;
    let path = directory.join(id).canonicalize().map_err(io_fault)?;
    if path.parent() != Some(directory.as_path()) {
        return Err(Fault::new("storage.invalid_backup"));
    }
    if fs::metadata(&path).map_err(io_fault)?.len() > 16 * 1024 * 1024 {
        return Err(Fault::new("file.too_large"));
    }
    fs::read(path).map_err(io_fault)
}
