use contracts::{Fault, FieldOption, NumericField, Result};
use serde_json::Value;
use std::sync::OnceLock;

pub fn edit(bytes: &[u8], values: &[u32]) -> Option<Result<Vec<u8>>> {
    let fields = describe(bytes)?;
    if fields.len() != values.len() {
        return Some(Err(Fault::new("trigger.field_count")));
    }
    let forms: Value =
        serde_json::from_str(include_str!("../../../schemas/commands/form-fields.json")).ok()?;
    let form = forms
        .as_array()?
        .iter()
        .find(|form| form["opcode"].as_u64() == Some(bytes[0].into()))?;
    let mut output = bytes.to_vec();
    for ((field, spec), value) in fields.iter().zip(form["fields"].as_array()?).zip(values) {
        if (*value > field.max || *value < field.min) && *value != field.value {
            return Some(Err(Fault::new("trigger.argument_range")));
        }
        let start = spec["offset"].as_u64()? as usize;
        let width = spec["width"].as_u64()? as usize;
        output[start..start + width].copy_from_slice(&value.to_le_bytes()[..width]);
    }
    Some(Ok(output))
}

pub fn describe(bytes: &[u8]) -> Option<Vec<NumericField>> {
    static FORMS: OnceLock<Value> = OnceLock::new();
    let forms = FORMS.get_or_init(|| {
        serde_json::from_str(include_str!("../../../schemas/commands/form-fields.json"))
            .expect("audited forms")
    });
    let form = forms
        .as_array()?
        .iter()
        .find(|form| form["opcode"].as_u64() == Some(bytes[0].into()))?;
    let mut covered = vec![false; bytes.len()];
    covered[0] = true;
    let mut fields = Vec::new();
    for field in form["fields"].as_array()? {
        let start = field["offset"].as_u64()? as usize;
        let width = field["width"].as_u64()? as usize;
        if !matches!(width, 1 | 2 | 4)
            || start + width > bytes.len()
            || covered[start..start + width].iter().any(|v| *v)
        {
            return None;
        }
        covered[start..start + width].fill(true);
        let value = bytes[start..start + width]
            .iter()
            .enumerate()
            .fold(0_u32, |acc, (i, byte)| acc | (u32::from(*byte) << (8 * i)));
        let maximum = u32::try_from(field["max"].as_u64()?).ok()?;
        let options = field["group"]
            .as_str()
            .map(|group| {
                (0..=maximum.min(255))
                    .map(|value| FieldOption {
                        value,
                        label_key: format!("{group}.{value}"),
                    })
                    .collect()
            })
            .unwrap_or_default();
        fields.push(NumericField {
            label_key: field["key"].as_str()?.into(),
            value,
            min: field["min"].as_u64()? as u32,
            max: maximum,
            options,
        });
    }
    covered.iter().all(|v| *v).then_some(fields)
}
