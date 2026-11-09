//! Lossless PUD section API. Does not interpret trigger commands or access files.
use contracts::{Fault, PudApi, PudDocument, Result, Section};

pub struct PudCodec;

impl PudCodec {
    fn oil<'a>(&self, document: &'a PudDocument) -> Result<&'a Section> {
        let mut sections = document.sections.iter().filter(|s| s.tag == *b"OILM");
        let section = sections
            .next()
            .ok_or_else(|| Fault::new("pud.missing_oilm"))?;
        if sections.next().is_some() {
            return Err(Fault::new("pud.duplicate_oilm"));
        }
        Ok(section)
    }
}

impl PudApi for PudCodec {
    fn parse(&self, bytes: &[u8]) -> Result<PudDocument> {
        if bytes.len() > 16 * 1024 * 1024 {
            return Err(Fault::new("file.too_large"));
        }
        let mut sections = Vec::new();
        let mut offset = 0;
        while offset < bytes.len() {
            let header = bytes
                .get(offset..offset + 8)
                .ok_or_else(|| Fault::at("pud.truncated_header", offset))?;
            let tag: [u8; 4] = header[..4].try_into().unwrap();
            let size = u32::from_le_bytes(header[4..].try_into().unwrap()) as usize;
            let end = offset
                .checked_add(8)
                .and_then(|v| v.checked_add(size))
                .ok_or_else(|| Fault::at("pud.invalid_length", offset))?;
            let payload = bytes
                .get(offset + 8..end)
                .ok_or_else(|| Fault::at("pud.truncated_section", offset))?;
            sections.push(Section {
                tag,
                offset,
                payload: payload.to_vec(),
            });
            offset = end;
        }
        let valid_type = sections.first().is_some_and(|s| {
            s.tag == *b"TYPE" && s.payload.len() == 16 && s.payload.starts_with(b"WAR2 MAP")
        });
        if !valid_type {
            return Err(Fault::new("pud.invalid_type"));
        }
        Ok(PudDocument {
            original: bytes.to_vec(),
            sections,
        })
    }

    fn program_area(&self, document: &PudDocument) -> Result<Vec<u8>> {
        Ok(self.oil(document)?.payload.clone())
    }

    fn replace_program(&self, document: &PudDocument, program: &[u8]) -> Result<Vec<u8>> {
        let section = self.oil(document)?;
        if program.len() > section.payload.len() {
            return Err(Fault::new("pud.capacity_exceeded").detail(section.payload.len()));
        }
        let mut result = document.original.clone();
        let start = section.offset + 8;
        result[start..start + program.len()].copy_from_slice(program);
        // Section size, unknown chunks and unused OILM tail are untouched.
        Ok(result)
    }
}

#[cfg(test)]
mod tests;
