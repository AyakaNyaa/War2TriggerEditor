use crate::Editor;
use contracts::*;

impl Editor {
    pub fn rule_preview(&self, id: &str, request: RuleRequest) -> Result<ChangePreview> {
        let session = self.revision(id, request.expected_revision)?;
        let mut commands = session.commands.clone();
        let end = request.replace_end.unwrap_or(request.index);
        if request.index > end || end > commands.len() {
            return Err(Fault::new("trigger.invalid_index"));
        }
        let view = self.view(id)?;
        if request.replace_end.is_some()
            && !view.program.blocks.iter().any(|block| {
                block.start == request.index
                    && block.end == end
                    && block.depth == 0
                    && block.editable_rule
            })
        {
            return Err(Fault::new("rule.unsafe_replacement"));
        }
        if request.index != commands.len()
            && !view
                .program
                .blocks
                .iter()
                .any(|block| block.start == request.index && block.depth == 0)
        {
            return Err(Fault::new("rule.unsafe_replacement"));
        }
        commands.drain(request.index..end);
        let compiled =
            self.services
                .triggers
                .compile_rule(&request.condition, &request.actions, &commands)?;
        commands.splice(request.index..request.index, compiled.commands);
        self.preview(
            id,
            &ChangeRequest {
                expected_revision: request.expected_revision,
                commands,
            },
        )
    }

    pub fn block_preview(
        &self,
        id: &str,
        revision: u64,
        start: usize,
        action: &str,
    ) -> Result<ChangePreview> {
        let session = self.revision(id, revision)?;
        let view = self.view(id)?;
        let blocks: Vec<_> = view
            .program
            .blocks
            .iter()
            .filter(|b| b.depth == 0)
            .collect();
        let position = blocks
            .iter()
            .position(|b| b.start == start)
            .ok_or_else(|| Fault::new("trigger.invalid_index"))?;
        let block = blocks[position];
        let mut commands = session.commands.clone();
        let segment = commands[block.start..block.end].to_vec();
        match action {
            "delete" => {
                commands.drain(block.start..block.end);
            }
            "duplicate" => {
                let mut copy = segment.clone();
                if block.editable_rule {
                    if let Some(condition) = block
                        .condition
                        .as_ref()
                        .filter(|c| c.kind == "units" || c.kind == "resources")
                    {
                        let actions: Vec<_> = block
                            .action_indices
                            .iter()
                            .map(|index| {
                                let instruction = &view.program.instructions[*index];
                                CommandDraftRequest {
                                    opcode: instruction.opcode,
                                    values: Some(
                                        instruction
                                            .fields
                                            .iter()
                                            .map(|field| field.value)
                                            .collect(),
                                    ),
                                    text: instruction.text.clone(),
                                }
                            })
                            .collect();
                        if let Ok(compiled) = self
                            .services
                            .triggers
                            .compile_rule(condition, &actions, &commands)
                        {
                            let header = compiled.commands.len() - actions.len() - 1;
                            let body: Vec<_> = block
                                .action_indices
                                .iter()
                                .map(|index| commands[*index].clone())
                                .collect();
                            if compiled.commands[header..compiled.commands.len() - 1] == body {
                                copy = compiled.commands;
                            }
                        }
                    }
                }
                commands.splice(block.end..block.end, copy);
            }
            "up" if position > 0 => {
                let previous = blocks[position - 1];
                let mut replacement = segment;
                replacement.extend_from_slice(&commands[previous.start..block.start]);
                commands.splice(previous.start..block.end, replacement);
            }
            "down" if position + 1 < blocks.len() => {
                let next = blocks[position + 1];
                let mut replacement = commands[block.end..next.end].to_vec();
                replacement.extend(segment);
                commands.splice(block.start..next.end, replacement);
            }
            _ => return Err(Fault::new("trigger.invalid_operation")),
        }
        self.preview(
            id,
            &ChangeRequest {
                expected_revision: revision,
                commands,
            },
        )
    }
}
