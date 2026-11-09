use app_api::{Editor, Services};
use contracts::*;
use std::{
    fs,
    path::{Path, PathBuf},
    sync::Arc,
};

fn editor(recovery: &Path) -> Editor {
    Editor::new(Services {
        pud: Arc::new(format_pud::PudCodec),
        w2tr: Arc::new(format_w2tr::W2trCodec),
        triggers: Arc::new(trigger_engine::TriggerEngine::default()),
        storage: Arc::new(storage::LocalStorage::new(recovery.to_path_buf())),
    })
}

fn fixtures(root: &Path) -> Vec<PathBuf> {
    let mut files = Vec::new();
    for entry in fs::read_dir(root).unwrap() {
        let path = entry.unwrap().path();
        if path.is_dir() {
            files.extend(fixtures(&path));
        } else if matches!(
            path.extension().and_then(|s| s.to_str()),
            Some("pud" | "w2tr")
        ) {
            files.push(path);
        }
    }
    files
}

#[test]
fn all_fourteen_files_roundtrip_through_the_center_and_edit_known_arguments() {
    let dir = tempfile::tempdir().unwrap();
    let mut editor = editor(dir.path());
    let root = PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("../../legacy-audit/source/tr");
    let paths = fixtures(&root);
    assert_eq!(paths.len(), 14);
    for path in paths {
        let bytes = fs::read(&path).unwrap();
        let snapshot = editor
            .services
            .storage
            .import(path.file_name().unwrap().to_str().unwrap(), &bytes)
            .unwrap();
        let view = editor.open(snapshot).unwrap();
        assert!(
            view.writable,
            "{}: {:?}",
            path.display(),
            view.program.diagnostics
        );
        assert_eq!(editor.export(&view.id).unwrap(), bytes);
        let index = view
            .program
            .instructions
            .iter()
            .position(|c| matches!(c.opcode, 1 | 5 | 103))
            .unwrap();
        let instruction = &view.program.instructions[index];
        let mut values: Vec<_> = instruction.fields.iter().map(|f| f.value).collect();
        let field = values.len() - 1;
        values[field] = (values[field] + 1) % (instruction.fields[field].max + 1);
        let preview = editor
            .command_preview(
                &view.id,
                CommandEditRequest {
                    expected_revision: 0,
                    action: "replace".into(),
                    index,
                    opcode: None,
                    values,
                    text: None,
                },
            )
            .unwrap();
        assert_eq!(preview.changed_bytes, 1);
        let next = editor
            .apply(
                &view.id,
                ChangeRequest {
                    expected_revision: 0,
                    commands: preview.commands,
                },
            )
            .unwrap();
        assert!(next.dirty);
        let output = editor.export(&view.id).unwrap();
        assert_eq!(output.len(), bytes.len());
        assert_eq!(bytes.iter().zip(&output).filter(|(a, b)| a != b).count(), 1);
        assert!(editor
            .apply(
                &view.id,
                ChangeRequest {
                    expected_revision: 0,
                    commands: vec![]
                }
            )
            .is_err());
        let undone = editor.history(&view.id, 1, false).unwrap();
        assert!(!undone.dirty);
        assert_eq!(editor.export(&view.id).unwrap(), bytes);
        editor.history(&view.id, 2, true).unwrap();
        assert_eq!(editor.export(&view.id).unwrap(), output);
    }
}

#[test]
fn recovery_survives_a_new_editor_instance_and_save_cleans_up_the_checkpoint() {
    let dir = tempfile::tempdir().unwrap();
    let path = dir.path().join("recover.w2tr");
    let original = vec![5, 0, 1, 254, 255, 0, 253];
    fs::write(&path, &original).unwrap();
    let recovery_dir = dir.path().join("recovery");
    let snapshot = storage::LocalStorage::new(recovery_dir.clone())
        .read_path(&path)
        .unwrap();
    let mut first = editor(&recovery_dir);
    let view = first.open(snapshot).unwrap();
    first
        .apply(
            &view.id,
            ChangeRequest {
                expected_revision: 0,
                commands: vec![vec![5, 0, 2]],
            },
        )
        .unwrap();
    drop(first);
    let mut second = editor(&recovery_dir);
    assert_eq!(second.services.storage.recoveries().unwrap().len(), 1);
    let restored = second.recover(&view.id).unwrap();
    assert!(restored.dirty);
    assert_eq!(restored.program.instructions[0].fields[1].value, 2);
    let receipt = second
        .save(
            &view.id,
            SaveRequest {
                expected_revision: 1,
                save_as: false,
            },
        )
        .unwrap();
    assert!(receipt.warnings.is_empty());
    assert_eq!(fs::read(receipt.backup).unwrap(), original);
    assert!(second.services.storage.recoveries().unwrap().is_empty());
    assert!(!second.view(&view.id).unwrap().dirty);
    let backups = second.backups(&view.id).unwrap();
    assert_eq!(backups.len(), 1);
    let result = second
        .restore(
            &view.id,
            RestoreRequest {
                expected_revision: 2,
                backup_id: backups[0].id.clone(),
            },
        )
        .unwrap();
    assert!(!result.document.dirty);
    assert_eq!(fs::read(&path).unwrap(), original);
    assert_eq!(second.backups(&view.id).unwrap().len(), 2);
}
