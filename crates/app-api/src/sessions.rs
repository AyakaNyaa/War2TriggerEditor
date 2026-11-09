use contracts::*;
use std::{collections::HashMap, sync::Arc};

pub struct Services {
    pub pud: Arc<dyn PudApi>,
    pub w2tr: Arc<dyn W2trApi>,
    pub triggers: Arc<dyn TriggerApi>,
    pub storage: Arc<dyn StorageApi>,
}

enum Container {
    Pud(PudDocument),
    W2tr(W2trDocument),
    Opaque,
}

pub(crate) struct Session {
    pub(crate) source: FileSnapshot,
    container: Container,
    original_program: Program,
    pub(crate) commands: Vec<Vec<u8>>,
    pub(crate) revision: u64,
    undo: Vec<Vec<Vec<u8>>>,
    redo: Vec<Vec<Vec<u8>>>,
    capacity: usize,
    diagnostics: Vec<Fault>,
}

pub struct Editor {
    pub services: Services,
    pub(crate) sessions: HashMap<String, Session>,
}

impl Editor {
    pub fn new(services: Services) -> Self {
        Self {
            services,
            sessions: HashMap::new(),
        }
    }

    pub fn open(&mut self, file: FileSnapshot) -> Result<DocumentView> {
        let id = uuid::Uuid::new_v4().to_string();
        let (container, area, diagnostics) = if file.name.to_lowercase().ends_with(".pud") {
            let document = self.services.pud.parse(&file.bytes)?;
            match self.services.pud.program_area(&document) {
                Ok(area) => (Container::Pud(document), area, Vec::new()),
                Err(error) => (Container::Pud(document), Vec::new(), vec![error]),
            }
        } else if file.name.to_lowercase().ends_with(".w2tr") {
            (Container::Opaque, file.bytes.clone(), Vec::new())
        } else {
            return Err(Fault::new("file.unsupported_type"));
        };
        let capacity = area.len();
        let original_program = self.services.triggers.decode(&area);
        let container = if matches!(container, Container::Opaque) {
            match original_program.length {
                Some(length) => Container::W2tr(self.services.w2tr.parse(&file.bytes, length)?),
                None => Container::Opaque,
            }
        } else {
            container
        };
        let mut diagnostics = diagnostics;
        if let Container::W2tr(document) = &container {
            diagnostics.extend(document.diagnostics.clone());
        }
        let commands = original_program
            .instructions
            .iter()
            .map(|c| c.bytes.clone())
            .collect();
        self.sessions.insert(
            id.clone(),
            Session {
                source: file,
                container,
                original_program,
                commands,
                revision: 0,
                undo: Vec::new(),
                redo: Vec::new(),
                capacity,
                diagnostics,
            },
        );
        self.view(&id)
    }

    pub(crate) fn session(&self, id: &str) -> Result<&Session> {
        self.sessions
            .get(id)
            .ok_or_else(|| Fault::new("document.not_found"))
    }

    pub(crate) fn revision(&self, id: &str, revision: u64) -> Result<&Session> {
        let session = self.session(id)?;
        if session.revision != revision {
            return Err(Fault::new("document.revision_conflict"));
        }
        Ok(session)
    }

    fn writable(session: &Session) -> bool {
        session.original_program.length.is_some()
            && session.original_program.diagnostics.is_empty()
            && session.diagnostics.is_empty()
    }

    fn bytes(&self, session: &Session, commands: &[Vec<u8>]) -> Result<Vec<u8>> {
        if !Self::writable(session) {
            if commands == session.commands {
                return Ok(session.source.bytes.clone());
            }
            return Err(Fault::new("document.readonly"));
        }
        let program = self
            .services
            .triggers
            .assemble(commands, session.original_program.terminator.unwrap())?;
        match &session.container {
            Container::Pud(document) => {
                let original_length = session.original_program.length.unwrap();
                let area = self.services.pud.program_area(document)?;
                if program.len() > original_length
                    && program.len() <= area.len()
                    && area[original_length..program.len()]
                        .iter()
                        .any(|byte| *byte != 0)
                {
                    return Err(Fault::new("pud.opaque_tail"));
                }
                self.services.pud.replace_program(document, &program)
            }
            Container::W2tr(document) => self.services.w2tr.replace_program(document, &program),
            Container::Opaque => Err(Fault::new("document.readonly")),
        }
    }

    pub fn view(&self, id: &str) -> Result<DocumentView> {
        let session = self.session(id)?;
        let bytes = self.bytes(session, &session.commands)?;
        let program = if Self::writable(session) {
            let raw = self.services.triggers.assemble(
                &session.commands,
                session.original_program.terminator.unwrap(),
            )?;
            self.services.triggers.decode(&raw)
        } else {
            session.original_program.clone()
        };
        let sections = match &session.container {
            Container::Pud(document) => document
                .sections
                .iter()
                .map(|s| SectionView {
                    tag: String::from_utf8_lossy(&s.tag).into_owned(),
                    size: s.payload.len(),
                })
                .collect(),
            _ => Vec::new(),
        };
        Ok(DocumentView {
            id: id.into(),
            name: session.source.name.clone(),
            kind: if matches!(session.container, Container::Pud(_)) {
                "pud"
            } else {
                "w2tr"
            }
            .into(),
            revision: session.revision,
            dirty: bytes != session.source.bytes,
            writable: Self::writable(session),
            capacity: session.capacity,
            original_size: session.source.bytes.len(),
            program,
            diagnostics: session.diagnostics.clone(),
            sections,
        })
    }

    pub fn preview(&self, id: &str, request: &ChangeRequest) -> Result<ChangePreview> {
        let session = self.revision(id, request.expected_revision)?;
        if !Self::writable(session) {
            return Err(Fault::new("document.readonly"));
        }
        let raw = self.services.triggers.assemble(
            &request.commands,
            session.original_program.terminator.unwrap(),
        )?;
        let output = self.bytes(session, &request.commands)?;
        let before = self.bytes(session, &session.commands)?;
        let changed_bytes = before.iter().zip(&output).filter(|(a, b)| a != b).count()
            + before.len().abs_diff(output.len());
        Ok(ChangePreview {
            base_revision: session.revision,
            program: self.services.triggers.decode(&raw),
            changed_bytes,
            output_size: output.len(),
            commands: request.commands.clone(),
        })
    }

    pub fn apply(&mut self, id: &str, request: ChangeRequest) -> Result<DocumentView> {
        self.preview(id, &request)?;
        let session = self.session(id)?;
        self.services.storage.checkpoint(
            id,
            &RecoveryState {
                version: 1,
                source: session.source.clone(),
                commands: request.commands.clone(),
                revision: session.revision + 1,
            },
        )?;
        let session = self.sessions.get_mut(id).unwrap();
        session
            .undo
            .push(std::mem::replace(&mut session.commands, request.commands));
        session.redo.clear();
        session.revision += 1;
        self.view(id)
    }

    pub fn history(&mut self, id: &str, revision: u64, redo: bool) -> Result<DocumentView> {
        let session = self.revision(id, revision)?;
        let next = if redo {
            session.redo.last()
        } else {
            session.undo.last()
        }
        .ok_or_else(|| Fault::new("document.empty_history"))?;
        self.bytes(session, next)?;
        self.services.storage.checkpoint(
            id,
            &RecoveryState {
                version: 1,
                source: session.source.clone(),
                commands: next.clone(),
                revision: revision + 1,
            },
        )?;
        let session = self.sessions.get_mut(id).unwrap();
        let next = if redo {
            session.redo.pop()
        } else {
            session.undo.pop()
        }
        .ok_or_else(|| Fault::new("document.empty_history"))?;
        let previous = std::mem::replace(&mut session.commands, next);
        if redo {
            session.undo.push(previous);
        } else {
            session.redo.push(previous);
        }
        session.revision += 1;
        self.view(id)
    }

    pub fn export(&self, id: &str) -> Result<Vec<u8>> {
        let session = self.session(id)?;
        self.bytes(session, &session.commands)
    }

    pub fn save(&mut self, id: &str, request: SaveRequest) -> Result<SaveReceipt> {
        let session = self.revision(id, request.expected_revision)?;
        let bytes = self.bytes(session, &session.commands)?;
        // Roundtrip-check the output before passing it to the storage API.
        if matches!(session.container, Container::Pud(_)) {
            self.services.pud.parse(&bytes)?;
        }
        let mut receipt = self
            .services
            .storage
            .save(&session.source, &bytes, request.save_as)?;
        let session = self.sessions.get_mut(id).unwrap();
        session.source.bytes = bytes;
        session.source.hash = receipt.hash.clone();
        session.source.path = Some(receipt.path.clone().into());
        if let Some(name) = std::path::Path::new(&receipt.path).file_name() {
            session.source.name = name.to_string_lossy().into_owned();
        }
        session.revision += 1;
        if let Err(error) = self.services.storage.clear_checkpoint(id) {
            receipt.warnings.push(error);
        }
        Ok(receipt)
    }

    pub fn recover(&mut self, id: &str) -> Result<DocumentView> {
        if self.sessions.contains_key(id) {
            return Err(Fault::new("recovery.already_open"));
        }
        let recovered = self.services.storage.recover(id)?;
        let view = self.open(recovered.source)?;
        let mut session = self.sessions.remove(&view.id).unwrap();
        self.bytes(&session, &recovered.commands)?;
        session.commands = recovered.commands;
        session.revision = recovered.revision;
        self.sessions.insert(id.into(), session);
        self.view(id)
    }
}
