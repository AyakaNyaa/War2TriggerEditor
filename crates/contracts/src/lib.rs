//! Shared API contracts. No file access, orchestration or implementation logic.
pub const API_VERSION: &str = "v1";
mod documents;
mod error;
mod formats;
mod storage;
mod triggers;

pub use documents::*;
pub use error::*;
pub use formats::*;
pub use storage::*;
pub use triggers::*;
