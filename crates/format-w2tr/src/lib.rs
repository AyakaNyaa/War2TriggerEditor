//! Lossless W2TR envelope API. Program boundaries are supplied by the center.
use contracts::{Fault, NameRecord, Result, W2trApi, W2trDocument};

pub struct W2trCodec;

impl W2trApi for W2trCodec {
    fn parse(&self, bytes: &[u8], program_length: usize) -> Result<W2trDocument> {
        if program_length < 2 || program_length > bytes.len() {
            return Err(Fault::new("w2tr.invalid_boundary"));
        }
        if !matches!(
            &bytes[program_length - 2..program_length],
            [254, 237] | [254, 255]
        ) {
            return Err(Fault::new("w2tr.invalid_terminator"));
        }
        let metadata = &bytes[program_length..];
        let mut names = Vec::new();
        let mut diagnostics = Vec::new();
        if !metadata.is_empty() {
            if !metadata.starts_with(&[0, 253]) {
                diagnostics.push(Fault::at("w2tr.unknown_metadata", program_length));
            } else {
                let mut offset = 2;
                while offset < metadata.len() {
                    let Some(header) = metadata.get(offset..offset + 3) else {
                        diagnostics.push(Fault::at("w2tr.truncated_name", program_length + offset));
                        break;
                    };
                    let id = u16::from_le_bytes([header[0], header[1]]);
                    let length = header[2] as usize;
                    let Some(raw) = metadata.get(offset + 3..offset + 3 + length) else {
                        diagnostics.push(Fault::at("w2tr.truncated_name", program_length + offset));
                        break;
                    };
                    names.push(NameRecord {
                        id,
                        raw: raw.to_vec(),
                    });
                    offset += 3 + length;
                }
            }
        }
        Ok(W2trDocument {
            program: bytes[..program_length].to_vec(),
            metadata: metadata.to_vec(),
            names,
            diagnostics,
        })
    }

    fn replace_program(&self, document: &W2trDocument, program: &[u8]) -> Result<Vec<u8>> {
        if !document.diagnostics.is_empty() && program != document.program {
            return Err(Fault::new("w2tr.opaque_metadata_readonly"));
        }
        let mut result = program.to_vec();
        result.extend_from_slice(&document.metadata);
        Ok(result)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn names_duplicates_unknown_ids_and_encoding_are_preserved() {
        let bytes = [
            5, 0, 1, 254, 255, 0, 253, 255, 255, 2, 0xc0, 0xff, 255, 255, 1, 0xc1,
        ];
        let doc = W2trCodec.parse(&bytes, 5).unwrap();
        assert_eq!(doc.names.len(), 2);
        assert_eq!(doc.names[0].id, 65535);
        assert_eq!(
            W2trCodec.replace_program(&doc, &doc.program).unwrap(),
            bytes
        );
        let changed = W2trCodec
            .replace_program(&doc, &[5, 0, 2, 254, 237])
            .unwrap();
        assert_eq!(&changed[5..], &bytes[5..]);
    }

    #[test]
    fn unknown_or_truncated_metadata_stays_lossless_but_readonly() {
        for bytes in [vec![254, 237, 0, 253, 1], vec![254, 255, 99, 12]] {
            let doc = W2trCodec.parse(&bytes, 2).unwrap();
            assert!(!doc.diagnostics.is_empty());
            assert_eq!(
                W2trCodec.replace_program(&doc, &doc.program).unwrap(),
                bytes
            );
            assert!(W2trCodec.replace_program(&doc, &[1, 1, 254, 255]).is_err());
        }
    }
}
