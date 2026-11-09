use crate::{Fault, Result};

#[derive(Clone, Debug)]
pub struct Section {
    pub tag: [u8; 4],
    pub offset: usize,
    pub payload: Vec<u8>,
}

#[derive(Clone, Debug)]
pub struct PudDocument {
    pub original: Vec<u8>,
    pub sections: Vec<Section>,
}

pub trait PudApi: Send + Sync {
    fn parse(&self, bytes: &[u8]) -> Result<PudDocument>;
    fn program_area(&self, document: &PudDocument) -> Result<Vec<u8>>;
    fn replace_program(&self, document: &PudDocument, program: &[u8]) -> Result<Vec<u8>>;
}

#[derive(Clone, Debug, PartialEq, Eq)]
pub struct NameRecord {
    pub id: u16,
    pub raw: Vec<u8>,
}

#[derive(Clone, Debug)]
pub struct W2trDocument {
    pub program: Vec<u8>,
    pub metadata: Vec<u8>,
    pub names: Vec<NameRecord>,
    pub diagnostics: Vec<Fault>,
}

pub trait W2trApi: Send + Sync {
    fn parse(&self, bytes: &[u8], program_length: usize) -> Result<W2trDocument>;
    fn replace_program(&self, document: &W2trDocument, program: &[u8]) -> Result<Vec<u8>>;
}
