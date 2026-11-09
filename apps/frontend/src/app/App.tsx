import { useEffect, useRef, useState } from 'react';
import { api } from '../shared/api';
import { translator, type Locale } from '../shared/i18n';
import type { BackupEntry, ChangePreview, CommandEditRequest, CommandSpec, DocumentView, RecoveryEntry } from '../shared/generated';
import { Inspector } from '../features/Inspector';
import { Preview } from '../features/Preview';

export function App() {
  const [locale, setLocale] = useState<Locale>(localStorage.getItem('war2.locale') === 'en' ? 'en' : 'ru');
  const [doc, setDoc] = useState<DocumentView>();
  const [catalog, setCatalog] = useState<CommandSpec[]>([]);
  const [selected, setSelected] = useState(0);
  const [query, setQuery] = useState('');
  const [opcode, setOpcode] = useState(5);
  const [busy, setBusy] = useState(false);
  const [draft, setDraft] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [preview, setPreview] = useState<ChangePreview>();
  const [help, setHelp] = useState(false);
  const [recoveries, setRecoveries] = useState<RecoveryEntry[]>([]);
  const [showRecovery, setShowRecovery] = useState(false);
  const [backups, setBackups] = useState<BackupEntry[]>();
  const [width, setWidth] = useState(Number(localStorage.getItem('war2.inspectorWidth')) || 330);
  const fileInput = useRef<HTMLInputElement>(null);
  const t = translator(locale);
  const instructions = doc?.program.instructions ?? [];
  const diagnostics = [...(doc?.diagnostics ?? []), ...(doc?.program.diagnostics ?? [])];

  useEffect(() => { api.catalog().then(setCatalog).catch(() => setError('api.unavailable')); }, []);
  useEffect(() => { api.recoveries().then(setRecoveries).catch(() => setError('api.unavailable')); }, []);
  useEffect(() => { document.documentElement.lang = locale; localStorage.setItem('war2.locale', locale); }, [locale]);
  useEffect(() => { localStorage.setItem('war2.inspectorWidth', String(width)); }, [width]);
  useEffect(() => {
    const unload = (event: BeforeUnloadEvent) => { if (doc?.dirty || draft) { event.preventDefault(); event.returnValue = ''; } };
    window.addEventListener('beforeunload', unload);
    return () => window.removeEventListener('beforeunload', unload);
  }, [doc?.dirty, draft]);

  async function work(action: () => Promise<void>) {
    if (busy) return;
    setBusy(true); setError(''); setNotice('');
    try { await action(); } catch (cause) { setError(cause instanceof Error ? cause.message : 'api.unavailable'); }
    finally { setBusy(false); }
  }
  function accept(next: DocumentView) { setDoc(next); setPreview(undefined); setSelected((i) => Math.min(i, Math.max(0, next.program.instructions.length - 1))); }
  function open(action: () => Promise<DocumentView>) {
    if ((doc?.dirty || draft) && !window.confirm(t('closeDirty'))) return;
    work(async () => { accept(await action()); setSelected(0); });
  }
  function commandPreview(edit: CommandEditRequest) {
    if (draft && edit.action !== 'replace' && !window.confirm(t('discardDraft'))) return;
    if (doc) work(async () => setPreview(await api.commandPreview(doc.id, edit)));
  }
  function save(saveAs: boolean) {
    if (draft) { setError('document.unapplied_fields'); return; }
    if (doc) work(async () => {
      const receipt = await api.save(doc, saveAs);
      accept(await api.document(doc.id));
      setNotice(`${t('backup')}: ${receipt.backup}`);
      if (receipt.warnings.length) setError(receipt.warnings[0].code);
      setRecoveries(await api.recoveries());
    });
  }
  const errorKey = `error.${error}`;
  const errorText = t(errorKey) === errorKey ? t('error.generic') : t(errorKey);

  return <div className="app-shell">
    <header className="topbar">
      <div className="brand-mark" aria-hidden="true">W<span>II</span></div>
      <div className="brand"><h1>{t('app.title')}</h1><span>{t('app.subtitle')}</span></div>
      <div className="topbar-right"><span className="local-badge"><i />{t('offline')}</span>
        <button className="quiet" onClick={() => setHelp(true)}>{t('help')}</button>
        <button className="quiet" onClick={() => work(async () => { setRecoveries(await api.recoveries()); setShowRecovery(true); })}>{t('recoveries')}{recoveries.length ? ` (${recoveries.length})` : ''}</button>
        <select aria-label="Language / Язык" value={locale} onChange={(event) => setLocale(event.target.value as Locale)}><option value="ru">Русский</option><option value="en">English</option></select>
      </div>
    </header>
    <nav className="toolbar">
      <div className="toolbar-group"><button className="gold" disabled={busy} onClick={() => open(api.open)}><span aria-hidden="true">▱</span> {t('open')}</button>
        <button disabled={busy} onClick={() => fileInput.current?.click()}>{t('import')}</button>
        <button disabled={busy} onClick={() => open(api.create)}>{t('newfile')}</button>
        <input ref={fileInput} aria-label={t('import')} hidden type="file" accept=".pud,.w2tr" onChange={(event) => {
          const file = event.target.files?.[0]; if (file) open(() => api.import(file)); event.target.value = '';
        }} /></div>
      {doc && <div className="toolbar-group"><button disabled={busy || !doc.writable} onClick={() => work(async () => accept(await api.history(doc, false)))}>{t('undo')}</button>
        <button disabled={busy} onClick={() => work(async () => setBackups(await api.backups(doc.id)))}>{t('backups')}</button>
        <button disabled={busy || !doc.writable} onClick={() => work(async () => accept(await api.history(doc, true)))}>{t('redo')}</button>
        <span className="toolbar-divider" /><button disabled={busy} onClick={() => save(true)}>{t('saveAs')}</button>
        <button className="gold" disabled={busy} onClick={() => save(false)}>{t('save')}</button></div>}
    </nav>
    {error && error !== 'dialog.cancelled' && <div className="message error" role="alert">{errorText}<button onClick={() => setError('')} aria-label={t('close')}>×</button></div>}
    {notice && <div className="message success" role="status">{notice}</div>}
    {busy && <div className="loading-bar" aria-label={t('pending')} />}
    {!doc ? <main className="welcome">
      <div className="welcome-emblem" aria-hidden="true"><span>W</span><b>II</b></div>
      <span className="eyebrow">{t('empty.formats')}</span><h2>{t('empty.title')}</h2><p>{t('empty.description')}</p>
      <button className="gold welcome-open" disabled={busy} onClick={() => open(api.open)}>{t('open')} <span aria-hidden="true">→</span></button>
      <div className="steps">{[1, 2, 3].map((number) => <article key={number}><span className="step-number">0{number}</span><h3>{t(`empty.step${number}`)}</h3><p>{t(`empty.detail${number}`)}</p></article>)}</div>
    </main> : <main className="workspace" style={{ '--inspector-width': `${width}px` } as React.CSSProperties}>
      <aside className="map-context"><span className="eyebrow">{doc.kind.toUpperCase()}</span><h2 className="filename">{doc.name}</h2>
        <span className={`document-state ${doc.dirty ? 'dirty' : ''}`}>{t(doc.dirty ? 'unsaved' : 'saved')}</span>
        <div className="capacity"><span>{t('capacity')}</span><strong>{doc.program.length ?? '—'} <small>/ {doc.kind === 'pud' ? doc.capacity.toLocaleString() : '∞'} {t('bytes')}</small></strong>
          <progress max={doc.kind === 'pud' ? doc.capacity : (doc.program.length ?? 1)} value={doc.program.length ?? 0} /></div>
        <h3 className="section-label">{t('sections')}</h3><ul className="section-list">{doc.sections.map((section, i) => <li key={i}><span>{section.tag}</span><small>{section.size.toLocaleString()}</small></li>)}</ul>
        <div className="revision">{t('revision')} {doc.revision}</div>
      </aside>
      <section className="sequence"><div className="pane-heading"><div><span className="eyebrow">{instructions.length} {t('count')}</span><h2>{t('triggers')}</h2></div></div>
        {!doc.writable && <div className="readonly">{t('readonly')}</div>}
        <input className="search" aria-label={t('search')} placeholder={t('search')} value={query} onChange={(event) => setQuery(event.target.value)} />
        <div className="command-list" role="listbox" aria-label={t('triggers')}>{instructions.map((instruction, index) => {
          if (query && !t(`command.${instruction.opcode}`).toLowerCase().includes(query.toLowerCase())) return null;
          return <button role="option" aria-selected={selected === index} className={`command-row ${selected === index ? 'selected' : ''}`} key={index} onClick={() => {
            if (index !== selected && draft && !window.confirm(t('discardDraft'))) return; setSelected(index);
          }}>
            <span className="row-number">{String(index + 1).padStart(2, '0')}</span><span className="command-icon" aria-hidden="true">{[22, 33, 23].includes(instruction.opcode) ? '◇' : '›'}</span>
            <span className="command-label"><strong>{t(`command.${instruction.opcode}`)}</strong><small>{instruction.text ?? instruction.fields.map((field) => `${t(field.label_key)}: ${field.value}`).join(' · ')}</small></span>
            <span className="byte-offset">{instruction.offset}</span>
          </button>;
        })}</div>
        <div className="add-command"><select aria-label={t('add')} value={opcode} disabled={!doc.writable || busy} onChange={(event) => setOpcode(Number(event.target.value))}>
          {catalog.map((spec) => <option key={spec.opcode} value={spec.opcode}>{t(spec.name_key)}</option>)}</select>
          <button disabled={!doc.writable || busy} onClick={() => commandPreview({ action: 'add', index: instructions.length, expected_revision: doc.revision, opcode, values: [] })}>＋ {t('add')}</button></div>
        <div className={`validation ${diagnostics.length ? 'has-errors' : ''}`}><span>{diagnostics.length ? '!' : '✓'} {t('diagnostics')}</span>
          {diagnostics.length ? diagnostics.map((fault, i) => <p key={i}>{t(`error.${fault.code}`)} {fault.offset != null ? `(${fault.offset})` : ''}</p>) : <p>{t('valid')}</p>}</div>
      </section>
      <Inspector instruction={instructions[selected]} index={selected} revision={doc.revision} disabled={busy || !doc.writable} t={t} preview={commandPreview} onDraftChange={setDraft} />
    </main>}
    <footer><span><i className="status-dot" />{t('localHint')}</span>{doc && <label className="resize">{t('resize')}<input aria-label={t('resize')} type="range" min="250" max="450" value={width} onChange={(event) => setWidth(Number(event.target.value))} /></label>}<span>v0.1.0</span></footer>
    {preview && doc && <Preview preview={preview} document={doc} busy={busy} t={t} cancel={() => setPreview(undefined)} apply={() => work(async () => accept(await api.apply(doc.id, preview)))} />}
    {help && <div className="overlay"><section role="dialog" aria-modal="true" className="dialog"><h2>{t('help')}</h2><p>{t('help.body')}</p><button className="gold" onClick={() => setHelp(false)}>{t('close')}</button></section></div>}
    {showRecovery && <div className="overlay"><section role="dialog" aria-modal="true" className="dialog"><h2>{t('recoveries')}</h2>
      {recoveries.map((entry) => <div className="recovery-entry" key={entry.id}><span>{entry.name} · {t('revision')} {entry.revision}</span><button disabled={busy} onClick={() => {
        if (doc?.dirty && !window.confirm(t('closeDirty'))) return;
        work(async () => { accept(await api.recover(entry.id)); setShowRecovery(false); });
      }}>{t('recover')}</button></div>)}
      <button onClick={() => setShowRecovery(false)}>{t('close')}</button></section></div>}
    {backups && doc && <div className="overlay"><section role="dialog" aria-modal="true" className="dialog"><h2>{t('backups')}</h2>
      {!backups.length && <p>{t('backups.empty')}</p>}
      {backups.map((entry) => <div className="recovery-entry" key={entry.id}><span>{new Date(entry.created_unix * 1000).toLocaleString(locale)} · {entry.size.toLocaleString()} {t('bytes')}</span>
        <button disabled={busy} onClick={() => {
          if (!window.confirm(t('restore.confirm'))) return;
          work(async () => { const result = await api.restore(doc, entry.id); accept(result.document); setBackups(undefined); setNotice(`${t('backup')}: ${result.receipt.backup}`); });
        }}>{t('recover')}</button></div>)}
      <button onClick={() => setBackups(undefined)}>{t('close')}</button></section></div>}
  </div>;
}
