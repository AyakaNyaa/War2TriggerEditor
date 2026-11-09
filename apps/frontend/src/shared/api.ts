import type { BackupEntry, RestoreResult, ChangePreview, CommandEditRequest, CommandSpec, DocumentView, RecoveryEntry, SaveReceipt } from './generated';
import type { CommandDraftRequest, Instruction, RuleRequest, BlockRequest } from './generated';

const token = document.querySelector<HTMLMetaElement>('meta[name="war2-session"]')?.content ?? '';

async function request<T>(path: string, body?: unknown): Promise<T> {
  const response = await fetch(`/api/v1${path}`, {
    method: body === undefined ? 'GET' : 'POST',
    headers: { 'Content-Type': 'application/json', 'X-War2-Session': token },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ code: 'api.unavailable' }));
    throw new Error(error.code ?? 'api.unavailable');
  }
  return response.json() as Promise<T>;
}

export const api = {
  catalog: () => request<CommandSpec[]>('/catalog'),
  draft: (draft: CommandDraftRequest) => request<Instruction>('/commands/draft', draft),
  rulePreview: (id: string, rule: RuleRequest) => request<ChangePreview>(`/documents/${id}/rules/preview`, rule),
  blockPreview: (id: string, edit: BlockRequest) => request<ChangePreview>(`/documents/${id}/blocks/preview`, edit),
  recoveries: () => request<RecoveryEntry[]>('/recoveries'),
  recover: (id: string) => request<DocumentView>(`/recoveries/${id}/open`, {}),
  open: () => request<DocumentView>('/documents/open', {}),
  import: async (file: File) => request<DocumentView>('/documents/import', {
    name: file.name, bytes: Array.from(new Uint8Array(await file.arrayBuffer())),
  }),
  create: () => request<DocumentView>('/documents/create', {}),
  document: (id: string) => request<DocumentView>(`/documents/${id}`),
  backups: (id: string) => request<BackupEntry[]>(`/documents/${id}/backups`),
  restore: (doc: DocumentView, backupId: string) => request<RestoreResult>(`/documents/${doc.id}/restore`, {
    expected_revision: doc.revision, backup_id: backupId,
  }),
  commandPreview: (id: string, edit: CommandEditRequest) =>
    request<ChangePreview>(`/documents/${id}/command-preview`, edit),
  apply: (id: string, preview: ChangePreview) => request<DocumentView>(`/documents/${id}/changes/apply`, {
    expected_revision: preview.base_revision, commands: preview.commands,
  }),
  history: (doc: DocumentView, redo: boolean) => request<DocumentView>(`/documents/${doc.id}/${redo ? 'redo' : 'undo'}`, {
    expected_revision: doc.revision,
  }),
  save: (doc: DocumentView, saveAs: boolean) => request<SaveReceipt>(`/documents/${doc.id}/save`, {
    expected_revision: doc.revision, save_as: saveAs,
  }),
};
