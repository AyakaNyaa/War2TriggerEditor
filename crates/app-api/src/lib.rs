//! Central application API: the only owner of editing sessions and use cases.
pub const VERSION: &str = env!("CARGO_PKG_VERSION");
mod backups;
mod builder;
mod commands;
mod http;
mod sessions;
pub use http::{openapi_document, router, ServerState};
pub use sessions::{Editor, Services};
