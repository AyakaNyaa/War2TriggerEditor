use crate::Result;
use serde::{Deserialize, Serialize};
use std::path::PathBuf;
use utoipa::ToSchema;

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct FileSnapshot {
    pub name: String,
    pub path: Option<PathBuf>,
    pub bytes: Vec<u8>,
    pub hash: String,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct RecoveryState {
    pub version: u32,
    pub source: FileSnapshot,
    pub commands: Vec<Vec<u8>>,
    pub revision: u64,
}

#[derive(Clone, Debug, Serialize, Deserialize, ToSchema)]
pub struct RecoveryEntry {
    pub id: String,
    pub name: String,
    pub revision: u64,
}

#[derive(Clone, Debug, Serialize, Deserialize, ToSchema)]
pub struct SaveReceipt {
    pub backup: String,
    pub hash: String,
    pub path: String,
    pub warnings: Vec<crate::Fault>,
}

pub trait StorageApi: Send + Sync {
    fn select_open(&self) -> Result<FileSnapshot>;
    fn import(&self, name: &str, bytes: &[u8]) -> Result<FileSnapshot>;
    fn save(&self, source: &FileSnapshot, bytes: &[u8], save_as: bool) -> Result<SaveReceipt>;
    fn checkpoint(&self, id: &str, state: &RecoveryState) -> Result<()>;
    fn recoveries(&self) -> Result<Vec<RecoveryEntry>>;
    fn recover(&self, id: &str) -> Result<RecoveryState>;
    fn clear_checkpoint(&self, id: &str) -> Result<()>;
    fn backups(&self, source: &FileSnapshot) -> Result<Vec<BackupEntry>>;
    fn read_backup(&self, source: &FileSnapshot, id: &str) -> Result<Vec<u8>>;
}

#[derive(Clone, Debug, Serialize, Deserialize, ToSchema)]
pub struct BackupEntry {
    pub id: String,
    pub size: u64,
    pub created_unix: u64,
}
