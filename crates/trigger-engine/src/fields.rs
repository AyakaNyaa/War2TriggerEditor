use contracts::{Fault, FieldOption, Instruction, NumericField, Result};
use encoding_rs::WINDOWS_1251;

// Descriptions stay on the Rust side; React does not know byte offsets or widths.
fn layout(bytes: &[u8]) -> Vec<(usize, usize, &'static str, u32)> {
    match bytes[0] {
        1 | 10 | 40 | 46 | 48 | 49 | 50 | 52 | 54 | 55 | 65 | 66 | 67 | 68 | 69 | 70 | 75 | 76
        | 88 | 98 => vec![(1, 1, "enabled", 1)],
        3 | 4 => vec![
            (1, 1, "player", if bytes[0] == 4 { 7 } else { 15 }),
            (2, 1, "player2", if bytes[0] == 4 { 7 } else { 15 }),
            (3, 1, "enabled", 1),
        ],
        5 => vec![(1, 1, "variable", 255), (2, 1, "value", 255)],
        6 => crate::units::layout(bytes),
        7 => vec![
            (1, 1, "variable", 255),
            (2, 1, "playerMask", 255),
            (3, 1, "extraPlayers", 3),
            (4, 1, "parameter", 59),
        ],
        8 => vec![
            (1, 1, "variable", 255),
            (2, 1, "comparison", 5),
            (3, 1, "variable2", 255),
            (4, 1, "flag", 255),
        ],
        9 => vec![
            (1, 1, "x", 127),
            (2, 1, "y", 127),
            (3, 1, "x2", 127),
            (4, 1, "y2", 127),
        ],
        11 | 12 => vec![(1, 1, "variable", 255), (2, 1, "globalValue", 95)],
        13..=17 => vec![(1, 1, "variable", 255), (2, 1, "variable2", 255)],
        18 => vec![
            (1, 1, "player", 15),
            (2, 1, "unit", 110),
            (3, 1, "unit2", 110),
        ],
        118 => vec![
            (1, 1, "variableX", 255),
            (2, 1, "variableY", 255),
            (3, 1, "unit", 106),
            (4, 1, "player", 15),
            (5, 1, "variable", 255),
        ],
        19 | 20 => vec![
            (1, 1, "x", 127),
            (2, 1, "y", 127),
            (3, 1, "unit", 106),
            (4, 1, "player", 15),
            (5, 1, if bytes[0] == 20 { "value" } else { "variable" }, 255),
        ],
        21 => vec![(1, 1, "flag", 255), (2, 1, "enabled", 1)],
        22 | 33 => vec![(1, 1, "flag", 255)],
        30 => vec![(1, 1, "variable", 255)],
        26 => vec![
            (1, 1, "player", 15),
            (2, 1, "argument", 5),
            (3, 1, "value", 255),
            (4, 1, "variable", 255),
        ],
        34 => vec![
            (1, 1, "player", 15),
            (2, 1, "argument", 5),
            (3, 4, "value", u32::MAX),
        ],
        37 => vec![(1, 1, "duration", 255)],
        120 | 122 | 123 => Vec::new(),
        121 => vec![(1, 1, "argument", 106)],
        108 => vec![
            (1, 2, "argument", 65535),
            (3, 1, "argument", 127),
            (4, 1, "argument", 127),
        ],
        _ => (1..bytes.len()).map(|i| (i, 1, "argument", 255)).collect(),
    }
}

fn text_area(bytes: &[u8]) -> Option<usize> {
    match bytes[0] {
        37 | 120 | 122 | 123 => Some(3),
        121 => Some(4),
        _ => None,
    }
}

pub fn describe(bytes: &[u8]) -> (Vec<NumericField>, Option<String>) {
    let text = text_area(bytes).map(|start| {
        WINDOWS_1251
            .decode_without_bom_handling(&bytes[start..])
            .0
            .trim_end_matches('\0')
            .to_owned()
    });
    if !matches!(bytes[0], 1 | 3..=22 | 26 | 30 | 33 | 34 | 37 | 108 | 118 | 120..=123) {
        if let Some(fields) = crate::legacy_forms::describe(bytes) {
            return (fields, text);
        }
    }
    let fields = layout(bytes)
        .into_iter()
        .map(|(offset, width, key, max)| {
            let value = bytes[offset..offset + width]
                .iter()
                .enumerate()
                .fold(0_u32, |acc, (i, byte)| acc | (u32::from(*byte) << (8 * i)));
            NumericField {
                label_key: key.into(),
                value,
                min: 0,
                max,
                options: options(key, max),
            }
        })
        .collect();
    (fields, text)
}

fn options(key: &str, max: u32) -> Vec<FieldOption> {
    let group = match key {
        "player" | "player2" => "player",
        "unit" | "unit2" => "unit",
        "comparison" | "stat" | "operation" | "resource" | "order" | "effect" | "parameter"
        | "extraPlayers" => key,
        _ => return Vec::new(),
    };
    (0..=max)
        .map(|value| FieldOption {
            value,
            label_key: format!("{group}.{value}"),
        })
        .collect()
}

pub fn edit(instruction: &Instruction, values: &[u32], text: Option<&str>) -> Result<Vec<u8>> {
    if !matches!(instruction.opcode, 1 | 3..=22 | 26 | 30 | 33 | 34 | 37 | 108 | 118 | 120..=123) {
        if let Some(result) = crate::legacy_forms::edit(&instruction.bytes, values) {
            return result;
        }
    }
    let mut bytes = instruction.bytes.clone();
    let layout = layout(&bytes);
    if values.len() != layout.len() {
        return Err(Fault::new("trigger.field_count"));
    }
    for ((offset, width, _, max), value) in layout.into_iter().zip(values) {
        if *value > max {
            return Err(Fault::new("trigger.argument_range"));
        }
        bytes[offset..offset + width].copy_from_slice(&value.to_le_bytes()[..width]);
    }
    // Editing a numeric property must not normalize untouched text bytes.
    if let Some(text) = text.filter(|value| Some(*value) != instruction.text.as_deref()) {
        let start = text_area(&bytes).ok_or_else(|| Fault::new("trigger.unexpected_text"))?;
        let (encoded, _, failed) = WINDOWS_1251.encode(text);
        if failed {
            return Err(Fault::new("trigger.unrepresentable_text"));
        }
        bytes.truncate(start);
        bytes.extend_from_slice(&encoded);
        if bytes[0] != 37 {
            bytes.push(0);
        }
        let length = bytes.len() - start;
        let maximum = if matches!(bytes[0], 121 | 123) {
            47
        } else if bytes[0] == 37 {
            59
        } else {
            511
        };
        if length > maximum {
            return Err(Fault::new("trigger.text_too_long"));
        }
        if bytes[0] == 37 {
            if length > 59 {
                return Err(Fault::new("trigger.text_too_long"));
            }
            bytes[2] = length as u8;
        } else {
            let offset = if bytes[0] == 121 { 2 } else { 1 };
            bytes[offset..offset + 2].copy_from_slice(&(length as u16).to_le_bytes());
        }
    }
    Ok(bytes)
}
