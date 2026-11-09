use crate::{Fault, Program, SaveReceipt};
use serde::{Deserialize, Serialize};
use utoipa::ToSchema;

#[derive(Clone, Debug, Serialize, Deserialize, ToSchema)]
pub struct DocumentView {
    pub id: String,
    pub name: String,
    pub kind: String,
    pub revision: u64,
    pub dirty: bool,
    pub writable: bool,
    pub capacity: usize,
    pub original_size: usize,
    pub program: Program,
    pub diagnostics: Vec<Fault>,
    pub sections: Vec<SectionView>,
}

#[derive(Clone, Debug, Serialize, Deserialize, ToSchema)]
pub struct SectionView {
    pub tag: String,
    pub size: usize,
}

#[derive(Clone, Debug, Serialize, Deserialize, ToSchema)]
pub struct ImportRequest {
    pub name: String,
    pub bytes: Vec<u8>,
}

#[derive(Clone, Debug, Serialize, Deserialize, ToSchema)]
pub struct ChangeRequest {
    pub expected_revision: u64,
    pub commands: Vec<Vec<u8>>,
}

#[derive(Clone, Debug, Serialize, Deserialize, ToSchema)]
pub struct RevisionRequest {
    pub expected_revision: u64,
}

#[derive(Clone, Debug, Serialize, Deserialize, ToSchema)]
pub struct SaveRequest {
    pub expected_revision: u64,
    pub save_as: bool,
}

#[derive(Clone, Debug, Serialize, Deserialize, ToSchema)]
pub struct ChangePreview {
    pub base_revision: u64,
    pub program: Program,
    pub changed_bytes: usize,
    pub output_size: usize,
    pub commands: Vec<Vec<u8>>,
}

#[derive(Clone, Debug, Serialize, Deserialize, ToSchema)]
pub struct CommandEditRequest {
    pub expected_revision: u64,
    pub action: String,
    pub index: usize,
    pub opcode: Option<u8>,
    pub values: Vec<u32>,
    pub text: Option<String>,
}

#[derive(Clone, Debug, Serialize, Deserialize, ToSchema)]
pub struct Health {
    pub version: String,
    pub api: String,
}

#[derive(Clone, Debug, Serialize, Deserialize, ToSchema)]
pub struct RestoreRequest {
    pub expected_revision: u64,
    pub backup_id: String,
}

#[derive(Clone, Debug, Serialize, Deserialize, ToSchema)]
pub struct RestoreResult {
    pub document: DocumentView,
    pub receipt: SaveReceipt,
}
