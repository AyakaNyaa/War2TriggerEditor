use contracts::{Fault, Instruction};

pub fn check(instructions: &[Instruction]) -> Vec<Fault> {
    let mut faults = Vec::new();
    let mut conditions = Vec::new();
    let mut repeat = None;
    for instruction in instructions {
        let bytes = &instruction.bytes;
        let offset = instruction.offset;
        let mut range = |index: usize, maximum: u8| {
            if bytes.get(index).is_some_and(|value| *value > maximum) {
                faults.push(Fault::at("trigger.argument_range", offset + index));
            }
        };
        match instruction.opcode {
            1 | 10 | 21 | 40 | 46 | 48 | 49 | 50 | 52 | 54 | 55 | 65 | 66 | 67 | 68 | 69 | 70
            | 75 | 76 | 88 | 98 => {
                // Opcode 21 is FLAG[id] = bool: its first argument is NOT a bool.
                if instruction.opcode == 21 {
                    range(2, 1);
                } else {
                    range(1, 1);
                }
            }
            3 => {
                range(1, 15);
                range(2, 15);
                range(3, 1);
            }
            4 => {
                range(1, 7);
                range(2, 7);
                range(3, 1);
            }
            // GMK uses VAL, comparison, VAL, FLAG; triggers.txt swaps the first two.
            8 => range(2, 5),
            11 | 12 => range(2, 95),
            9 | 32 => {
                for index in 1..bytes.len() {
                    range(index, 127);
                }
            }
            22 | 33 => conditions.push(offset),
            23 => {
                if conditions.pop().is_none() {
                    faults.push(Fault::at("trigger.unmatched_if_end", offset));
                }
            }
            37 if bytes[2] > 59 => faults.push(Fault::at("trigger.text_too_long", offset)),
            120 | 122 if bytes.len() > 514 => {
                faults.push(Fault::at("trigger.text_too_long", offset))
            }
            121 if bytes.len() > 51 => faults.push(Fault::at("trigger.text_too_long", offset)),
            123 if bytes.len() > 50 => faults.push(Fault::at("trigger.text_too_long", offset)),
            125 => {
                if repeat.replace(offset).is_some() {
                    faults.push(Fault::at("trigger.nested_repeat", offset));
                }
            }
            126 if repeat.take().is_none() => {
                faults.push(Fault::at("trigger.unmatched_repeat_end", offset));
            }
            _ => {}
        }
    }
    for offset in conditions {
        faults.push(Fault::at("trigger.unclosed_if", offset));
    }
    if let Some(offset) = repeat {
        faults.push(Fault::at("trigger.unclosed_repeat", offset));
    }
    faults
}
