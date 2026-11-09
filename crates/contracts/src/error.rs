use serde::{Deserialize, Serialize};
use std::fmt;
use utoipa::ToSchema;

pub type Result<T> = std::result::Result<T, Fault>;

#[derive(Debug, Clone, Serialize, Deserialize, ToSchema)]
pub struct Fault {
    pub code: String,
    pub offset: Option<usize>,
    pub detail: Option<String>,
}

impl Fault {
    pub fn new(code: &str) -> Self {
        Self {
            code: code.into(),
            offset: None,
            detail: None,
        }
    }

    pub fn at(code: &str, offset: usize) -> Self {
        Self {
            offset: Some(offset),
            ..Self::new(code)
        }
    }

    pub fn detail(mut self, detail: impl ToString) -> Self {
        self.detail = Some(detail.to_string());
        self
    }
}

impl fmt::Display for Fault {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "{} at {:?}: {:?}", self.code, self.offset, self.detail)
    }
}

impl std::error::Error for Fault {}
