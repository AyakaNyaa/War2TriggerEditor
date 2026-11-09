use crate::Editor;
use contracts::*;

impl Editor {
    pub fn command_preview(&self, id: &str, request: CommandEditRequest) -> Result<ChangePreview> {
        let session = self.revision(id, request.expected_revision)?;
        let mut commands = session.commands.clone();
        let index = request.index;
        if index > commands.len() {
            return Err(Fault::new("trigger.invalid_index"));
        }
        match request.action.as_str() {
            "add" => {
                let opcode = request
                    .opcode
                    .ok_or_else(|| Fault::new("trigger.unknown_opcode"))?;
                let draft = self.services.triggers.draft(&CommandDraftRequest {
                    opcode,
                    values: if request.values.is_empty() {
                        None
                    } else {
                        Some(request.values.clone())
                    },
                    text: request.text.clone(),
                })?;
                commands.insert(index, draft.bytes);
                if matches!(opcode, 22 | 33 | 125) {
                    commands.insert(index + 1, vec![if opcode == 125 { 126 } else { 23 }]);
                }
            }
            "replace" => {
                let view = self.view(id)?;
                let instruction = view
                    .program
                    .instructions
                    .get(index)
                    .ok_or_else(|| Fault::new("trigger.invalid_index"))?;
                commands[index] = self.services.triggers.edit(
                    instruction,
                    &request.values,
                    request.text.as_deref(),
                )?;
            }
            "delete" if index < commands.len() => {
                commands.remove(index);
            }
            "duplicate" if index < commands.len() => {
                commands.insert(index, commands[index].clone());
            }
            "up" if index > 0 && index < commands.len() => commands.swap(index, index - 1),
            "down" if index + 1 < commands.len() => commands.swap(index, index + 1),
            _ => return Err(Fault::new("trigger.invalid_operation")),
        }
        self.preview(
            id,
            &ChangeRequest {
                expected_revision: request.expected_revision,
                commands,
            },
        )
    }
}
