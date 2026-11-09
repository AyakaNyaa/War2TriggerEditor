use app_api::{Editor, Services};
use contracts::*;
use std::sync::Arc;

fn condition() -> RuleCondition {
    RuleCondition {
        kind: "units".into(),
        player: 1,
        unit: 107,
        comparison: 0,
        amount: 0,
        resource: 0,
        flag: 0,
        flag_value: true,
    }
}
fn request(revision: u64, index: usize) -> RuleRequest {
    RuleRequest {
        expected_revision: revision,
        index,
        replace_end: None,
        condition: condition(),
        actions: vec![CommandDraftRequest {
            opcode: 24,
            values: None,
            text: None,
        }],
    }
}
fn apply(editor: &mut Editor, id: &str, preview: ChangePreview) -> DocumentView {
    editor
        .apply(
            id,
            ChangeRequest {
                expected_revision: preview.base_revision,
                commands: preview.commands,
            },
        )
        .unwrap()
}

#[test]
fn semantic_rules_edit_duplicate_move_delete_and_undo_as_complete_blocks() {
    let dir = tempfile::tempdir().unwrap();
    let mut editor = Editor::new(Services {
        pud: Arc::new(format_pud::PudCodec),
        w2tr: Arc::new(format_w2tr::W2trCodec),
        triggers: Arc::new(trigger_engine::TriggerEngine::default()),
        storage: Arc::new(storage::LocalStorage::new(dir.path().to_path_buf())),
    });
    let original = [254, 237, 0, 253];
    let file = editor
        .services
        .storage
        .import("builder.w2tr", &original)
        .unwrap();
    let first = editor.open(file).unwrap();
    let preview = editor.rule_preview(&first.id, request(0, 0)).unwrap();
    assert!(!editor.view(&first.id).unwrap().dirty);
    assert_eq!(editor.export(&first.id).unwrap(), original);
    let added = apply(&mut editor, &first.id, preview);
    assert_eq!(added.program.blocks.len(), 1);
    assert_eq!(added.program.blocks[0].action_indices.len(), 1);
    assert!(editor.rule_preview(&first.id, request(0, 0)).is_err());
    assert!(editor.rule_preview(&first.id, request(1, 1)).is_err());
    let mut edit = request(1, 0);
    edit.replace_end = Some(added.program.instructions.len());
    edit.condition.amount = 2;
    let preview = editor.rule_preview(&first.id, edit).unwrap();
    let changed = apply(&mut editor, &first.id, preview);
    assert_eq!(
        changed.program.blocks[0].condition.as_ref().unwrap().amount,
        2
    );
    let preview = editor.block_preview(&first.id, 2, 0, "duplicate").unwrap();
    let duplicated = apply(&mut editor, &first.id, preview);
    assert_eq!(duplicated.program.blocks.len(), 2);
    assert!(duplicated.program.blocks.iter().all(|b| b.editable_rule));
    let end = duplicated.program.blocks[1].start;
    let left = &duplicated.program.instructions[0..end];
    let right = &duplicated.program.instructions[end..];
    assert_ne!(left[2].bytes[1], right[2].bytes[1]);
    let preview = editor.block_preview(&first.id, 3, 0, "down").unwrap();
    apply(&mut editor, &first.id, preview);
    let preview = editor.block_preview(&first.id, 4, 0, "delete").unwrap();
    let deleted = apply(&mut editor, &first.id, preview);
    assert_eq!(deleted.program.blocks.len(), 1);
    assert!(deleted.program.blocks[0].editable_rule);
    let undo = editor.history(&first.id, 5, false).unwrap();
    assert_eq!(undo.program.blocks.len(), 2);
    assert!(undo.program.diagnostics.is_empty());
}
