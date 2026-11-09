use contracts::{Instruction, RuleCondition, ScenarioBlock};

fn condition(kind: &str) -> RuleCondition {
    RuleCondition {
        kind: kind.into(),
        player: 0,
        unit: 107,
        comparison: 0,
        amount: 0,
        resource: 0,
        flag: 0,
        flag_value: true,
    }
}

pub fn blocks(instructions: &[Instruction]) -> Vec<ScenarioBlock> {
    let commands: Vec<_> = instructions.iter().map(|i| i.bytes.as_slice()).collect();
    let mut result = Vec::new();
    scan(&commands, 0, commands.len(), 0, &mut result);
    result
}

fn scan(
    commands: &[&[u8]],
    mut index: usize,
    limit: usize,
    depth: usize,
    result: &mut Vec<ScenarioBlock>,
) {
    while index < limit {
        let start = index;
        let mut header = index;
        let mut parsed = None;
        // Recognize only exact, source-verified templates. Other bytecode keeps
        // its original command representation, including arbitrary nested IFs.
        if index + 5 < limit
            && commands[index].len() == 3
            && commands[index][..2] == [6, 0]
            && commands[index + 1].len() == 6
            && commands[index + 1][..3] == [6, 2, 44]
            && commands[index + 1][4..] == [0, 0]
            && commands[index + 2].len() == 2
            && commands[index + 2][0] == 30
            && commands[index + 3].len() == 3
            && commands[index + 3][0] == 5
            && commands[index + 4].len() == 5
            && commands[index + 4][0] == 8
            && commands[index + 4][1] == commands[index + 2][1]
            && commands[index + 4][3] == commands[index + 3][1]
            && commands[index + 5] == [22, commands[index + 4][4]]
        {
            let mut value = condition("units");
            value.unit = commands[index][2];
            value.player = commands[index + 1][3];
            value.comparison = commands[index + 4][2];
            value.amount = commands[index + 3][2].into();
            parsed = Some(value);
            header = index + 5;
        } else if index + 1 < limit
            && commands[index].len() == 9
            && commands[index][0] == 35
            && commands[index + 1] == [22, commands[index][8]]
        {
            let mut value = condition("resources");
            value.player = commands[index][1];
            value.resource = commands[index][2];
            value.amount = u32::from_le_bytes(commands[index][3..7].try_into().unwrap());
            value.comparison = commands[index][7];
            parsed = Some(value);
            header = index + 1;
        }
        if matches!(commands[header][0], 22 | 33 | 125) {
            let opener = commands[header][0];
            let closer = if opener == 125 { 126 } else { 23 };
            let mut nesting = 1;
            let mut end = header + 1;
            while end < limit {
                if (closer == 23 && matches!(commands[end][0], 22 | 33))
                    || commands[end][0] == opener
                {
                    nesting += 1;
                }
                if commands[end][0] == closer {
                    nesting -= 1;
                    if nesting == 0 {
                        break;
                    }
                }
                end += 1;
            }
            if end < limit {
                if parsed.is_none() && opener != 125 {
                    let mut value = condition("flag");
                    value.flag = commands[header][1];
                    value.flag_value = opener == 22;
                    parsed = Some(value);
                }
                let registers = if header > start {
                    &commands[start..header]
                } else {
                    &[]
                };
                let scratch: Vec<_> = if parsed.as_ref().is_some_and(|p| p.kind == "units") {
                    vec![
                        commands[start + 2][1],
                        commands[start + 3][1],
                        commands[header][1],
                    ]
                } else if parsed.as_ref().is_some_and(|p| p.kind == "resources") {
                    vec![commands[header][1]]
                } else {
                    Vec::new()
                };
                let external_collision = !registers.is_empty()
                    && commands
                        .iter()
                        .enumerate()
                        .filter(|(i, _)| *i < start || *i > end)
                        .flat_map(|(_, c)| c.iter())
                        .any(|byte| scratch.contains(byte));
                let has_structure = commands[header + 1..end]
                    .iter()
                    .any(|c| matches!(c[0], 22 | 23 | 33 | 125 | 126));
                let aliased = scratch
                    .iter()
                    .enumerate()
                    .any(|(i, slot)| scratch[..i].contains(slot));
                let body_collision = commands[header + 1..end]
                    .iter()
                    .flat_map(|c| c.iter())
                    .any(|byte| scratch.contains(byte));
                result.push(ScenarioBlock {
                    start,
                    end: end + 1,
                    depth,
                    kind: if opener == 125 { "repeat" } else { "rule" }.into(),
                    condition: parsed,
                    action_indices: (header + 1..end).collect(),
                    editable_rule: opener != 125
                        && !external_collision
                        && !has_structure
                        && !aliased
                        && !body_collision,
                });
                if has_structure {
                    scan(commands, header + 1, end, depth + 1, result);
                }
                index = end + 1;
                continue;
            }
        }
        result.push(ScenarioBlock {
            start,
            end: start + 1,
            depth,
            kind: "command".into(),
            condition: None,
            action_indices: vec![start],
            editable_rule: false,
        });
        index += 1;
    }
}
