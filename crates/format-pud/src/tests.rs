use super::*;
use std::{fs, path::PathBuf};

#[test]
fn supplied_maps_preserve_all_bytes_and_only_patch_requested_area() {
    let root = PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("../../legacy-audit/source/tr");
    let mut count = 0;
    for entry in fs::read_dir(root).unwrap() {
        let path = entry.unwrap().path();
        if path.extension().and_then(|s| s.to_str()) != Some("pud") {
            continue;
        }
        count += 1;
        let bytes = fs::read(path).unwrap();
        let document = PudCodec.parse(&bytes).unwrap();
        let program = PudCodec.program_area(&document).unwrap();
        assert_eq!(
            PudCodec.replace_program(&document, &program).unwrap(),
            bytes
        );
        let section = PudCodec.oil(&document).unwrap();
        let changed = PudCodec
            .replace_program(&document, &[5, 0, 1, 254, 255])
            .unwrap();
        let start = section.offset + 8;
        assert_eq!(&changed[..start], &bytes[..start]);
        assert_eq!(&changed[start + 5..], &bytes[start + 5..]);
        assert_eq!(changed.len(), bytes.len());
    }
    assert_eq!(count, 4);
}

#[test]
fn malformed_lengths_and_duplicate_oilm_are_rejected() {
    let mut bytes = b"TYPE\x10\0\0\0WAR2 MAP\0\0\0\0\0\0\0\0".to_vec();
    bytes.extend_from_slice(b"OILM\x02\0\0\0\xfe\xff");
    let valid = PudCodec.parse(&bytes).unwrap();
    assert!(PudCodec.replace_program(&valid, &[1, 2, 3]).is_err());
    bytes.extend_from_slice(b"OILM\x02\0\0\0\xfe\xff");
    assert!(PudCodec
        .program_area(&PudCodec.parse(&bytes).unwrap())
        .is_err());
    bytes.pop();
    assert!(PudCodec.parse(&bytes).is_err());
    for size in 0..24 {
        assert!(PudCodec.parse(&bytes[..size]).is_err());
    }
}
