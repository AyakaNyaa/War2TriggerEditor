//! Trigger bytecode API. Independent of file containers, storage and UI.
mod fields;
mod units;
mod validation;
use contracts::{CommandSpec, Fault, Instruction, Program, Result, TriggerApi};

pub struct TriggerEngine {
    catalog: Vec<CommandSpec>,
}

impl Default for TriggerEngine {
    fn default() -> Self {
        Self {
            catalog: serde_json::from_str(include_str!(
                "../../../schemas/commands/legacy-1.6.1.json"
            ))
            .expect("embedded catalog"),
        }
    }
}

impl TriggerEngine {
    fn length(&self, data: &[u8], offset: usize) -> Result<usize> {
        let opcode = *data
            .first()
            .ok_or_else(|| Fault::at("trigger.truncated", offset))?;
        let byte = |i| {
            data.get(i)
                .copied()
                .map(usize::from)
                .ok_or_else(|| Fault::at("trigger.truncated", offset))
        };
        match opcode {
            6 => {
                let sub = byte(1)?;
                // GMK trig, all 28 explicitly handled units-list subcommands.
                const SIZES: [usize; 28] = [
                    3, 2, 6, 5, 2, 2, 3, 2, 4, 3, 4, 2, 5, 4, 2, 3, 3, 3, 4, 3, 3, 3, 5, 4, 4, 5,
                    2, 4,
                ];
                SIZES
                    .get(sub)
                    .copied()
                    .ok_or_else(|| Fault::at("trigger.unknown_subcommand", offset))
            }
            37 => Ok(3 + byte(2)?),
            120 | 122 | 123 => Ok(3 + byte(1)? + 256 * byte(2)?),
            121 => Ok(4 + byte(2)? + 256 * byte(3)?),
            254 => match byte(1)? {
                237 | 255 => Ok(2),
                _ => Err(Fault::at("trigger.invalid_terminator", offset)),
            },
            _ => self
                .catalog
                .get(opcode as usize)
                .and_then(|spec| spec.length)
                .ok_or_else(|| Fault::at("trigger.unknown_opcode", offset)),
        }
    }
}

impl TriggerApi for TriggerEngine {
    fn catalog(&self) -> Vec<CommandSpec> {
        self.catalog.clone()
    }

    fn decode(&self, bytes: &[u8]) -> Program {
        let mut result = Program {
            instructions: Vec::new(),
            length: None,
            terminator: None,
            diagnostics: Vec::new(),
        };
        let mut offset = 0;
        while offset < bytes.len() {
            let length = match self.length(&bytes[offset..], offset) {
                Ok(length) => length,
                Err(error) => {
                    result.diagnostics.push(error);
                    return result;
                }
            };
            let Some(command) = bytes.get(offset..offset + length) else {
                result
                    .diagnostics
                    .push(Fault::at("trigger.truncated", offset));
                return result;
            };
            if command[0] == 254 {
                result.length = Some(offset + length);
                result.terminator = Some(command[1]);
                result
                    .diagnostics
                    .extend(validation::check(&result.instructions));
                return result;
            }
            let (fields, text) = fields::describe(command);
            result.instructions.push(Instruction {
                offset,
                opcode: command[0],
                bytes: command.to_vec(),
                fields,
                text,
            });
            offset += length;
        }
        result
            .diagnostics
            .push(Fault::at("trigger.missing_terminator", offset));
        result
    }

    fn assemble(&self, commands: &[Vec<u8>], terminator: u8) -> Result<Vec<u8>> {
        if !matches!(terminator, 237 | 255) {
            return Err(Fault::new("trigger.invalid_terminator"));
        }
        let mut bytes = Vec::new();
        for command in commands {
            if command.first() == Some(&254) || self.length(command, bytes.len())? != command.len()
            {
                return Err(Fault::at("trigger.invalid_command_length", bytes.len()));
            }
            bytes.extend_from_slice(command);
            if bytes.len() > 1024 * 1024 {
                return Err(Fault::new("file.too_large"));
            }
        }
        bytes.extend_from_slice(&[254, terminator]);
        let decoded = self.decode(&bytes);
        if let Some(error) = decoded.diagnostics.into_iter().next() {
            return Err(error);
        }
        Ok(bytes)
    }

    fn create(&self, opcode: u8) -> Result<Vec<u8>> {
        match opcode {
            6 => Ok(vec![6, 0, 0]),
            37 => Ok(vec![37, 10, 0]),
            120 | 122 | 123 => Ok(vec![opcode, 1, 0, 0]),
            121 => Ok(vec![121, 0, 1, 0, 0]),
            _ => {
                let size = self
                    .catalog
                    .get(opcode as usize)
                    .and_then(|s| s.length)
                    .ok_or_else(|| Fault::new("trigger.unknown_opcode"))?;
                let mut bytes = vec![0; size];
                bytes[0] = opcode;
                Ok(bytes)
            }
        }
    }

    fn edit(
        &self,
        instruction: &Instruction,
        values: &[u32],
        text: Option<&str>,
    ) -> Result<Vec<u8>> {
        if instruction.opcode == 6
            && values
                .first()
                .is_some_and(|sub| *sub != u32::from(instruction.bytes[1]))
        {
            let sub = u8::try_from(values[0]).map_err(|_| Fault::new("trigger.argument_range"))?;
            let length = self.length(&[6, sub], 0)?;
            let mut bytes = vec![0; length];
            bytes[0] = 6;
            bytes[1] = sub;
            return Ok(bytes);
        }
        fields::edit(instruction, values, text)
    }
}

#[cfg(test)]
mod tests;
