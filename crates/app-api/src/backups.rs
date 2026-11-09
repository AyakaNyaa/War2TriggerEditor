use crate::sessions::Editor;
use contracts::*;

impl Editor {
    pub fn backups(&self, id: &str) -> Result<Vec<BackupEntry>> {
        self.services.storage.backups(&self.session(id)?.source)
    }

    pub fn restore(&mut self, id: &str, request: RestoreRequest) -> Result<RestoreResult> {
        let session = self.revision(id, request.expected_revision)?;
        let source = session.source.clone();
        let bytes = self
            .services
            .storage
            .read_backup(&source, &request.backup_id)?;
        let candidate = self.services.storage.import(&source.name, &bytes)?;
        let temporary_view = self.open(candidate)?;
        let mut replacement = self.sessions.remove(&temporary_view.id).unwrap();
        let mut receipt = self.services.storage.save(&source, &bytes, false)?;
        replacement.source.path = Some(receipt.path.clone().into());
        replacement.source.hash = receipt.hash.clone();
        replacement.revision = request.expected_revision + 1;
        self.sessions.insert(id.into(), replacement);
        if let Err(error) = self.services.storage.clear_checkpoint(id) {
            receipt.warnings.push(error);
        }
        Ok(RestoreResult {
            document: self.view(id)?,
            receipt,
        })
    }
}
