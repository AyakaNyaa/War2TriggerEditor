import type { ChangePreview, DocumentView } from '../shared/generated';

type Props = { preview: ChangePreview; document: DocumentView; busy: boolean;
  t: (key: string) => string; apply: () => void; cancel: () => void };

export function Preview({ preview, document, busy, t, apply, cancel }: Props) {
  const before = document.program.instructions;
  const after = preview.program.instructions;
  const changed = Array.from({ length: Math.max(before.length, after.length) }, (_, i) => i)
    .filter((i) => JSON.stringify(before[i]?.bytes) !== JSON.stringify(after[i]?.bytes));
  const describe = (instruction: (typeof before)[number] | undefined) => instruction
    ? `${t(`command.${instruction.opcode}`)} · ${instruction.fields.map((f) => `${t(f.label_key)}: ${f.value}`).join(', ')}${instruction.text != null ? ` · ${instruction.text}` : ''}`
    : '—';
  return <div className="overlay"><section role="dialog" aria-modal="true" aria-labelledby="preview-title" className="dialog">
    <span className="eyebrow">{t('revision')} {preview.base_revision}</span><h2 id="preview-title">{t('preview.title')}</h2>
    <p className="muted">{t('preview.description')}</p>
    <div className="preview-metrics"><div><strong>{preview.changed_bytes}</strong><span>{t('preview.bytes')}</span></div>
      <div><strong>{preview.program.length}</strong><span>{t('preview.program')}</span></div></div>
    <div className="diff-list">{changed.map((i) => <div className="diff-pair" key={i}>
      <div className="diff-before"><b>− {i + 1}</b> {describe(before[i])}</div>
      <div className="diff-after"><b>+ {i + 1}</b> {describe(after[i])}</div>
    </div>)}</div>
    <div className="dialog-actions"><button disabled={busy} onClick={cancel}>{t('cancel')}</button>
      <button disabled={busy} className="gold" onClick={apply}>{t('apply')}</button></div>
  </section></div>;
}
