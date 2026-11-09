use crate::{Fault, Result};
use serde::{Deserialize, Serialize};
use utoipa::ToSchema;

#[derive(Clone, Debug, Serialize, Deserialize, ToSchema)]
pub struct CommandSpec {
    pub opcode: u8,
    pub length: Option<usize>,
    pub name_key: String,
    pub source: String,
}

#[derive(Clone, Debug, Serialize, Deserialize, ToSchema)]
pub struct Instruction {
    pub offset: usize,
    pub opcode: u8,
    pub bytes: Vec<u8>,
    pub fields: Vec<NumericField>,
    pub text: Option<String>,
}

#[derive(Clone, Debug, Serialize, Deserialize, ToSchema)]
pub struct NumericField {
    pub label_key: String,
    pub value: u32,
    pub min: u32,
    pub max: u32,
    pub options: Vec<FieldOption>,
}

#[derive(Clone, Debug, Serialize, Deserialize, ToSchema)]
pub struct FieldOption {
    pub value: u32,
    pub label_key: String,
}

#[derive(Clone, Debug, Serialize, Deserialize, ToSchema)]
pub struct Program {
    pub instructions: Vec<Instruction>,
    pub length: Option<usize>,
    pub terminator: Option<u8>,
    pub diagnostics: Vec<Fault>,
}

pub trait TriggerApi: Send + Sync {
    fn catalog(&self) -> Vec<CommandSpec>;
    fn decode(&self, bytes: &[u8]) -> Program;
    fn assemble(&self, commands: &[Vec<u8>], terminator: u8) -> Result<Vec<u8>>;
    fn create(&self, opcode: u8) -> Result<Vec<u8>>;
    fn edit(
        &self,
        instruction: &Instruction,
        values: &[u32],
        text: Option<&str>,
    ) -> Result<Vec<u8>>;
}
