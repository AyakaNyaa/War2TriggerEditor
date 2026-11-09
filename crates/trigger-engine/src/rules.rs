use crate::TriggerEngine;
use contracts::*;

fn free_registers(existing: &[Vec<u8>], count: usize) -> Result<Vec<u8>> {
    // Conservatively reserve EVERY byte seen in the existing program, not just
    // guessed register references. Also reserve implicit VAL[0] and low slots.
    let mut occupied = [false; 256];
    occupied[..16].fill(true);
    for byte in existing.iter().flatten() {
        occupied[*byte as usize] = true;
    }
    let free: Vec<_> = (16..=255_u16)
        .rev()
        .filter(|i| !occupied[*i as usize])
        .take(count)
        .map(|i| i as u8)
        .collect();
    if free.len() != count {
        return Err(Fault::new("rule.no_free_registers"));
    }
    Ok(free)
}

pub fn compile(
    engine: &TriggerEngine,
    condition: &RuleCondition,
    actions: &[CommandDraftRequest],
    existing: &[Vec<u8>],
) -> Result<CompiledRule> {
    if actions.is_empty() {
        return Err(Fault::new("rule.missing_action"));
    }
    if condition.player > 15
        || condition.comparison > 5
        || condition.unit > 110
        || condition.resource > 2
    {
        return Err(Fault::new("trigger.argument_range"));
    }
    let mut commands = Vec::new();
    let mut registers = Vec::new();
    match condition.kind.as_str() {
        "always" => {}
        "units" => {
            if condition.amount > 255 {
                return Err(Fault::new("trigger.argument_range"));
            }
            registers = free_registers(existing, 3)?;
            let (count, target, flag) = (registers[0], registers[1], registers[2]);
            // Verified against creator6_1 (Owner=44), trig:30, trig:8 and ex/1.
            commands.extend([
                vec![6, 0, condition.unit],
                vec![6, 2, 44, condition.player, 0, 0],
                vec![30, count],
                vec![5, target, condition.amount as u8],
                vec![8, count, condition.comparison, target, flag],
                vec![22, flag],
            ]);
        }
        "resources" => {
            if condition.player > 7 {
                return Err(Fault::new("trigger.argument_range"));
            }
            registers = free_registers(existing, 1)?;
            let mut compare = vec![35, condition.player, condition.resource];
            compare.extend_from_slice(&condition.amount.to_le_bytes());
            compare.extend_from_slice(&[condition.comparison, registers[0]]);
            commands.extend([compare, vec![22, registers[0]]]);
        }
        "flag" => commands.push(vec![
            if condition.flag_value { 22 } else { 33 },
            condition.flag,
        ]),
        _ => return Err(Fault::new("rule.unknown_condition")),
    }
    let mut body = Vec::new();
    for action in actions {
        let spec = engine
            .catalog
            .get(action.opcode as usize)
            .ok_or_else(|| Fault::new("trigger.unknown_opcode"))?;
        if spec.kind == "structure" || spec.stage == "preload" || spec.kind == "condition" {
            return Err(Fault::new("rule.invalid_action"));
        }
        body.push(engine.draft(action)?.bytes);
    }
    // Actions must not read/write scratch registers chosen for the condition.
    // Re-select with action bytes included if any collision is possible.
    if body.iter().flatten().any(|byte| registers.contains(byte)) {
        let mut occupied = existing.to_vec();
        occupied.extend(body);
        return compile(engine, condition, actions, &occupied);
    }
    commands.extend(body);
    if condition.kind != "always" {
        commands.push(vec![23]);
    }
    engine.assemble(&commands, 237)?;
    Ok(CompiledRule {
        commands,
        internal_registers: registers,
    })
}
