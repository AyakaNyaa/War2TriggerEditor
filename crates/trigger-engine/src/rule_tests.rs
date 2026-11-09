use super::*;
use contracts::{CommandDraftRequest, RuleCondition};

fn condition(kind: &str) -> RuleCondition {
    RuleCondition {
        kind: kind.into(),
        player: 1,
        unit: 107,
        comparison: 0,
        amount: 0,
        resource: 0,
        flag: 0,
        flag_value: true,
    }
}
fn victory() -> Vec<CommandDraftRequest> {
    vec![CommandDraftRequest {
        opcode: 24,
        values: None,
        text: None,
    }]
}

// Minimal reference semantics for the documented instructions used by these
// templates. This is deliberately not a claim of War2Combat runtime compatibility.
fn wins(commands: &[Vec<u8>], units: &[(u8, u8)], resources: u32) -> bool {
    let mut values = [0_u32; 256];
    let mut flags = [false; 256];
    let mut found = Vec::new();
    let mut execute = true;
    let compare = |a: u32, method: u8, b: u32| match method {
        0 => a == b,
        1 => a != b,
        2 => a >= b,
        3 => a <= b,
        4 => a > b,
        5 => a < b,
        _ => false,
    };
    for command in commands {
        match command[0] {
            6 if command[1] == 0 => {
                found = units
                    .iter()
                    .copied()
                    .filter(|(unit, _)| command[2] == 107 || *unit == command[2])
                    .collect()
            }
            6 if command[1] == 2 => found.retain(|(_, owner)| *owner == command[3]),
            30 => values[command[1] as usize] = found.len() as u32,
            5 => values[command[1] as usize] = command[2].into(),
            8 => {
                flags[command[4] as usize] = compare(
                    values[command[1] as usize],
                    command[2],
                    values[command[3] as usize],
                )
            }
            35 => {
                flags[command[8] as usize] = compare(
                    resources,
                    command[7],
                    u32::from_le_bytes(command[3..7].try_into().unwrap()),
                )
            }
            22 => execute = flags[command[1] as usize],
            33 => execute = !flags[command[1] as usize],
            23 => execute = true,
            24 if execute => return true,
            _ => {}
        }
    }
    false
}

#[test]
fn victory_requires_the_selected_players_units_to_match_the_condition() {
    let engine = TriggerEngine::default();
    let compiled = engine
        .compile_rule(&condition("units"), &victory(), &[])
        .unwrap();
    assert!(wins(&compiled.commands, &[], 0));
    assert!(!wins(&compiled.commands, &[(0, 1)], 0));
    assert!(wins(&compiled.commands, &[(0, 0)], 0));
    let bytes = engine.assemble(&compiled.commands, 255).unwrap();
    let program = engine.decode(&bytes);
    assert_eq!(program.blocks.len(), 1);
    assert_eq!(program.blocks[0].condition.as_ref().unwrap().kind, "units");
    assert!(program.blocks[0].editable_rule);
    assert_eq!(program.blocks[0].action_indices.len(), 1);
}

#[test]
fn resource_threshold_is_a_full_u32_and_uses_the_selected_comparison() {
    let engine = TriggerEngine::default();
    let mut condition = condition("resources");
    condition.comparison = 2;
    condition.amount = 50_000;
    let compiled = engine.compile_rule(&condition, &victory(), &[]).unwrap();
    assert!(!wins(&compiled.commands, &[], 49_999));
    assert!(wins(&compiled.commands, &[], 50_000));
    let raw = engine.assemble(&compiled.commands, 237).unwrap();
    let decoded = engine.decode(&raw);
    assert_eq!(decoded.blocks[0].condition.as_ref().unwrap().amount, 50_000);
}

#[test]
fn scratch_allocation_never_reuses_any_existing_or_action_byte() {
    let engine = TriggerEngine::default();
    let existing = vec![vec![5, 255, 254], vec![21, 253, 1]];
    let result = engine
        .compile_rule(&condition("units"), &victory(), &existing)
        .unwrap();
    assert!(result
        .internal_registers
        .iter()
        .all(|register| !existing.iter().flatten().any(|byte| byte == register)));
    assert!(engine
        .compile_rule(&condition("units"), &victory(), &[(0..=255).collect()])
        .is_err());
    let preload = [CommandDraftRequest {
        opcode: 104,
        values: None,
        text: None,
    }];
    assert!(engine
        .compile_rule(&condition("units"), &preload, &[])
        .is_err());
}

#[test]
fn configured_drafts_preserve_text_and_all_multi_byte_parameters() {
    let engine = TriggerEngine::default();
    let text = engine
        .draft(&CommandDraftRequest {
            opcode: 120,
            values: None,
            text: Some("Победите противника".into()),
        })
        .unwrap();
    assert_eq!(text.text.as_deref(), Some("Победите противника"));
    let compare = engine
        .draft(&CommandDraftRequest {
            opcode: 35,
            values: Some(vec![1, 0, 50_000, 2, 200]),
            text: None,
        })
        .unwrap();
    assert_eq!(
        u32::from_le_bytes(compare.bytes[3..7].try_into().unwrap()),
        50_000
    );
    assert_eq!(compare.fields.len(), 5);
    let units = engine
        .draft(&CommandDraftRequest {
            opcode: 6,
            values: Some(vec![2, 44, 1, 0]),
            text: None,
        })
        .unwrap();
    assert_eq!(units.bytes, [6, 2, 44, 1, 0, 0]);
}
