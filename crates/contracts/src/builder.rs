use serde::{Deserialize, Serialize};
use utoipa::ToSchema;

#[derive(Clone, Debug, Serialize, Deserialize, ToSchema)]
pub struct CommandDraftRequest {
    pub opcode: u8,
    pub values: Option<Vec<u32>>,
    pub text: Option<String>,
}

#[derive(Clone, Debug, Serialize, Deserialize, ToSchema)]
pub struct RuleCondition {
    pub kind: String,
    pub player: u8,
    pub unit: u8,
    pub comparison: u8,
    pub amount: u32,
    pub resource: u8,
    pub flag: u8,
    pub flag_value: bool,
}

#[derive(Clone, Debug, Serialize, Deserialize, ToSchema)]
pub struct RuleRequest {
    pub expected_revision: u64,
    pub index: usize,
    pub replace_end: Option<usize>,
    pub condition: RuleCondition,
    pub actions: Vec<CommandDraftRequest>,
}

#[derive(Clone, Debug, Serialize, Deserialize, ToSchema)]
pub struct ScenarioBlock {
    pub start: usize,
    pub end: usize,
    pub depth: usize,
    pub kind: String,
    pub condition: Option<RuleCondition>,
    pub action_indices: Vec<usize>,
    pub editable_rule: bool,
}

#[derive(Clone, Debug, Serialize, Deserialize, ToSchema)]
pub struct CompiledRule {
    pub commands: Vec<Vec<u8>>,
    pub internal_registers: Vec<u8>,
}

#[derive(Clone, Debug, Serialize, Deserialize, ToSchema)]
pub struct BlockRequest {
    pub expected_revision: u64,
    pub start: usize,
    pub action: String,
}
