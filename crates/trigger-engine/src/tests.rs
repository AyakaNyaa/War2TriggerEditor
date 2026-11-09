use super::*;
use std::{
    fs,
    path::{Path, PathBuf},
};

fn collect(root: &Path, paths: &mut Vec<PathBuf>) {
    for item in fs::read_dir(root).unwrap() {
        let path = item.unwrap().path();
        if path.is_dir() {
            collect(&path, paths);
        } else if path.extension().and_then(|s| s.to_str()) == Some("w2tr") {
            paths.push(path);
        }
    }
}

#[test]
fn all_ten_programs_decode_on_instruction_boundaries_and_reassemble_identically() {
    let engine = TriggerEngine::default();
    let root = PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("../../legacy-audit/source/tr");
    let mut paths = Vec::new();
    collect(&root, &mut paths);
    assert_eq!(paths.len(), 10);
    for path in paths {
        let bytes = fs::read(&path).unwrap();
        let program = engine.decode(&bytes);
        assert!(
            program.diagnostics.is_empty(),
            "{}: {:?}",
            path.display(),
            program.diagnostics
        );
        let commands: Vec<_> = program
            .instructions
            .iter()
            .map(|c| c.bytes.clone())
            .collect();
        let rebuilt = engine
            .assemble(&commands, program.terminator.unwrap())
            .unwrap();
        assert_eq!(
            rebuilt,
            bytes[..program.length.unwrap()],
            "{}",
            path.display()
        );
    }
}

#[test]
fn marker_inside_message_is_not_a_terminator() {
    let program = TriggerEngine::default().decode(&[37, 10, 4, 254, 255, 0, 253, 254, 237]);
    assert_eq!(program.length, Some(9));
    assert_eq!(program.instructions.len(), 1);
    assert!(program.diagnostics.is_empty());
}

#[test]
fn unknown_or_truncated_commands_never_guess_a_boundary() {
    let engine = TriggerEngine::default();
    for bytes in [
        vec![128, 254, 255],
        vec![6, 99, 254, 237],
        vec![5, 0],
        vec![120, 255, 255, 0],
    ] {
        let program = engine.decode(&bytes);
        assert_eq!(program.length, None);
        assert!(!program.diagnostics.is_empty());
    }
    assert!(engine.assemble(&[vec![22, 0]], 255).is_err());
    assert!(engine.assemble(&[vec![5, 0, 0, 0]], 255).is_err());
}

#[test]
fn deterministic_random_inputs_do_not_panic() {
    let engine = TriggerEngine::default();
    let mut state = 42_u32;
    for length in 0..1024 {
        let bytes: Vec<_> = (0..length)
            .map(|_| {
                state = state.wrapping_mul(1664525).wrapping_add(1013904223);
                (state >> 24) as u8
            })
            .collect();
        let _ = engine.decode(&bytes);
    }
}

#[test]
fn editing_numeric_property_preserves_untouched_text_and_rejects_unencodable_changes() {
    let engine = TriggerEngine::default();
    // An undefined CP1251 byte and an explicit NUL must survive unrelated edits.
    let program = engine.decode(&[37, 10, 3, 0x98, b'A', 0, 254, 255]);
    let command = &program.instructions[0];
    let edited = engine
        .edit(command, &[20], command.text.as_deref())
        .unwrap();
    assert_eq!(edited, [37, 20, 3, 0x98, b'A', 0]);
    assert!(engine.edit(command, &[20], Some("😀")).is_err());
    let changed = engine.edit(command, &[20], Some("Привет")).unwrap();
    let bytes = engine.assemble(&[changed], 255).unwrap();
    assert_eq!(
        engine.decode(&bytes).instructions[0].text.as_deref(),
        Some("Привет")
    );
}

#[test]
fn changing_units_operation_rebuilds_parameters_on_the_rust_side() {
    let engine = TriggerEngine::default();
    let program = engine.decode(&[6, 0, 0, 254, 255]);
    let command = &program.instructions[0];
    assert_eq!(command.fields[0].options.len(), 28);
    let edited = engine.edit(command, &[2, 0], None).unwrap();
    assert_eq!(edited, [6, 2, 0, 0, 0, 0]);
    let bytes = engine.assemble(&[edited], 255).unwrap();
    assert_eq!(engine.decode(&bytes).instructions[0].fields.len(), 4);
}
