import { useEffect, useRef, useState } from 'react';
import { api } from '../shared/api';
import { translator, type Locale } from '../shared/i18n';
import { blockMatches } from '../shared/presentation';
import type { BackupEntry, ChangePreview, CommandSpec, DocumentView, RecoveryEntry, ScenarioBlock } from '../shared/generated';
import { Catalog } from '../features/Catalog';
import { Builder, type BuilderSelection, type BuilderValue } from '../features/Builder';
import { Scenario } from '../features/Scenario';
import { Preview } from '../features/Preview';
import { initialCondition } from '../features/ConditionFields';
import { FileDialogs } from './FileDialogs';

export function App() {
  const [locale, setLocale] = useState<Locale>(localStorage.getItem('war2.locale') === 'en' ? 'en' : 'ru');
  const [doc, setDoc] = useState<DocumentView>();
  const [catalog, setCatalog] = useState<CommandSpec[]>([]);
  const [query, setQuery] = useState('');
  const [group, setGroup] = useState('all');
  const [busy, setBusy] = useState(false);
  const [draft, setDraft] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [selection, setSelection] = useState<BuilderSelection>();
  const [preview, setPreview] = useState<{ value: ChangePreview; index: number }>();
  const [help, setHelp] = useState(false);
  const [recoveries, setRecoveries] = useState<RecoveryEntry[]>([]);
  const [showRecovery, setShowRecovery] = useState(false);
  const [backups, setBackups] = useState<BackupEntry[]>();
  const [width, setWidth] = useState(Math.max(380, Number(localStorage.getItem('war2.inspectorWidth')) || 420));
  const counter = useRef(0);
  const fileInput = useRef<HTMLInputElement>(null);
  const search = useRef<HTMLInputElement>(null);
  const t = translator(locale);
  const diagnostics = [...(doc?.diagnostics ?? []), ...(doc?.program.diagnostics ?? [])];
  useEffect(() => { api.catalog().then(setCatalog).catch(() => setError('api.unavailable')); api.recoveries().then(setRecoveries).catch(() => {}); }, []);
  useEffect(() => { document.documentElement.lang = locale; localStorage.setItem('war2.locale', locale); setNotice(''); }, [locale]);
  useEffect(() => { localStorage.setItem('war2.inspectorWidth', String(width)); }, [width]);
  useEffect(() => {
    const unload = (event: BeforeUnloadEvent) => { if (doc?.dirty || draft) { event.preventDefault(); event.returnValue = ''; } };
    window.addEventListener('beforeunload', unload); return () => window.removeEventListener('beforeunload', unload);
  }, [doc?.dirty, draft]);
  useEffect(() => {
    const keys = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); search.current?.focus(); }
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's') { event.preventDefault(); save(false); }
    };
    window.addEventListener('keydown', keys); return () => window.removeEventListener('keydown', keys);
  });
  async function work(action: () => Promise<void>) {
    if (busy) return; setBusy(true); setError(''); setNotice('');
    try { await action(); } catch (cause) { setError(cause instanceof Error ? cause.message : 'api.unavailable'); }
    finally { setBusy(false); }
  }
  const canLeave = () => !draft || window.confirm(t('discardDraft'));
  const chooseBlock = (next: DocumentView, block: ScenarioBlock, guard = true) => {
    if (guard && !canLeave()) return;
    setDraft(false);
    if (block.kind === 'rule' && block.editable_rule && block.condition) {
      setSelection({ key: ++counter.current, mode: 'rule', index: block.start, replaceEnd: block.end,
        condition: block.condition, actions: block.action_indices.map((index) => next.program.instructions[index]) });
    } else setSelection({ key: ++counter.current, mode: 'command', index: block.start,
      instruction: next.program.instructions[block.start] });
  };
  const accept = (next: DocumentView, index?: number) => {
    setDoc(next); setPreview(undefined); setDraft(false);
    const block = next.program.blocks.find((b) => b.start === (index ?? selection?.index) && b.depth === 0);
    if (block) chooseBlock(next, block, false); else setSelection(undefined);
  };
  function open(action: () => Promise<DocumentView>) {
    if ((doc?.dirty || draft) && !window.confirm(t('closeDirty'))) return;
    work(async () => { const next = await action(); setDoc(next); setSelection(undefined); setDraft(false); setQuery(''); setNotice(t('notice.opened')); });
  }
  function newRule() {
    if (!doc || !canLeave()) return;
    setSelection({ key: ++counter.current, mode: 'rule', index: doc.program.instructions.length }); setDraft(false);
  }
  function choose(spec: CommandSpec) {
    if (!doc || !canLeave()) return;
    if (spec.opcode === 35) {
      setSelection({ key: ++counter.current, mode: 'rule', index: doc.program.instructions.length,
        condition: { ...initialCondition(), kind: 'resources' } });
    } else setSelection({ key: ++counter.current, mode: spec.kind === 'setting' || spec.kind === 'condition' || spec.kind === 'structure' || spec.group === 'values' ? 'command' : 'rule', opcode: spec.opcode,
      index: spec.stage === 'preload' ? 0 : doc.program.instructions.length });
    setDraft(false);
  }
  function submit(value: BuilderValue, showPreview: boolean) {
    if (!doc) return;
    work(async () => {
      const edit = value.selection;
      const result = edit.mode === 'rule' ? await api.rulePreview(doc.id, {
        expected_revision: doc.revision, index: edit.index, replace_end: edit.replaceEnd,
        condition: value.condition, actions: value.actions,
      }) : await api.commandPreview(doc.id, { expected_revision: doc.revision, index: edit.index,
        action: edit.instruction ? 'replace' : 'add', opcode: value.actions[0].opcode,
        values: value.actions[0].values ?? [], text: value.actions[0].text });
      if (showPreview) setPreview({ value: result, index: edit.index });
      else { accept(await api.apply(doc.id, result), edit.index); setNotice(t('notice.applied')); }
    });
  }
  function save(saveAs: boolean) {
    if (!doc || busy) return;
    if (draft) { setError('document.unapplied_fields'); return; }
    work(async () => {
      const receipt = await api.save(doc, saveAs); accept(await api.document(doc.id));
      setNotice(`${t('backup')}: ${receipt.backup}`); if (receipt.warnings.length) setError(receipt.warnings[0].code);
      setRecoveries(await api.recoveries());
    });
  }
  const errorKey = `error.${error}`;
  const scenarioMatches = doc?.program.blocks.filter((block) => block.depth === 0 && blockMatches(block, doc.program, catalog, query, t)).length ?? 0;
  return <div className="app-shell">
    <header className="topbar"><div className="brand-mark" aria-hidden="true">W<span>II</span></div><div className="brand"><h1>{t('app.title')}</h1><span>{t('app.subtitle')}</span></div>
      <div className="global-search"><span aria-hidden="true">⌕</span><input ref={search} aria-label={t('search.global')} placeholder={t('search.global')} value={query} onChange={(event) => { setQuery(event.target.value); setGroup('all'); }} /><kbd>Ctrl K</kbd>
        {query && <button className="icon-button" aria-label={t('search.clear')} onClick={() => setQuery('')}>×</button>}</div>
      <div className="topbar-right"><button className="quiet" onClick={() => setHelp(true)}>{t('help')}</button><select aria-label="Language / Язык" value={locale} onChange={(event) => setLocale(event.target.value as Locale)}><option value="ru">Русский</option><option value="en">English</option></select></div>
    </header>
    <nav className="toolbar"><div className="toolbar-group"><button disabled={busy} onClick={() => open(api.open)}>▱ {t('open')}</button><button disabled={busy} onClick={() => fileInput.current?.click()}>{t('import')}</button>
      <button disabled={busy} onClick={() => open(api.create)}>＋ {t('newfile')}</button><input ref={fileInput} aria-label={t('import')} hidden type="file" accept=".pud,.w2tr" onChange={(event) => { const file = event.target.files?.[0]; if (file) open(() => api.import(file)); event.target.value = ''; }} /></div>
      {doc && <div className="toolbar-group"><button disabled={busy || !doc.writable} onClick={() => { if (canLeave()) work(async () => accept(await api.history(doc, false))); }}>{t('undo')}</button><button disabled={busy || !doc.writable} onClick={() => { if (canLeave()) work(async () => accept(await api.history(doc, true))); }}>{t('redo')}</button>
        <button disabled={busy} onClick={() => work(async () => setBackups(await api.backups(doc.id)))}>{t('backups')}</button><button disabled={busy} onClick={() => save(true)}>{t('saveAs')}</button><button className="gold" disabled={busy} onClick={() => save(false)}>{t('save')}</button></div>}
      <button className="quiet recovery-button" onClick={() => work(async () => { setRecoveries(await api.recoveries()); setShowRecovery(true); })}>{t('recoveries')}{recoveries.length ? ` (${recoveries.length})` : ''}</button></nav>
    {error && error !== 'dialog.cancelled' && <div className="message error" role="alert">{t(errorKey) === errorKey ? t('error.generic') : t(errorKey)}<button className="icon-button" onClick={() => setError('')} aria-label={t('close')}>×</button></div>}
    {notice && <div className="message success" role="status">✓ {notice}</div>}{busy && <div className="loading-bar" aria-label={t('pending')} />}
    {doc && <div className="document-bar"><span className="file-kind">{doc.kind.toUpperCase()}</span><h2>{doc.name}</h2><span className={`document-state ${doc.dirty ? 'dirty' : ''}`}>{t(draft ? 'draft' : doc.dirty ? 'unsaved' : 'saved')}</span>
      <span className="document-size">{doc.program.length ?? '—'} {doc.kind === 'pud' ? `/ ${doc.capacity.toLocaleString()}` : ''} {t('bytes')}</span></div>}
    <main className={`workspace ${!doc ? 'no-document' : ''}`} style={{ '--inspector-width': `${width}px` } as React.CSSProperties}>
      <Catalog catalog={catalog} query={query} group={group} onGroup={setGroup} onChoose={choose} onNewRule={newRule} locale={locale} t={t} disabled={busy || !doc?.writable} />
      {doc ? <Scenario document={doc} catalog={catalog} query={query} locale={locale} t={t} selected={selection?.index} busy={busy} onSelect={(block) => chooseBlock(doc, block)} onInstruction={(index) => {
        if (canLeave()) { setSelection({ key: ++counter.current, mode: 'command', index, instruction: doc.program.instructions[index] }); setDraft(false); }
      }} onNewRule={newRule} onBlock={(block, action) => {
        if (!canLeave()) return; work(async () => { const result = await api.blockPreview(doc.id, { expected_revision: doc.revision, start: block.start, action }); accept(await api.apply(doc.id, result), action === 'duplicate' ? block.end : block.start); setNotice(t('notice.applied')); });
      }} /> : <section className="welcome"><div className="welcome-emblem" aria-hidden="true">W<span>II</span></div><span className="eyebrow">WARCRAFT II</span><h2>{t('welcome.title')}</h2><p>{t('welcome.body')}</p><div className="welcome-actions"><button className="gold" disabled={busy} onClick={() => open(api.create)}>{t('newfile')}</button><button disabled={busy} onClick={() => open(api.open)}>{t('open')}</button></div>
        <div className="welcome-flow"><span className="type-label condition-label">{t('when')}</span><span>→</span><span className="type-label action-label">{t('then')}</span><span>→</span><span className="type-label setting-label">{t('save')}</span></div></section>}
      <Builder selection={selection} catalog={catalog} locale={locale} t={t} busy={busy || !doc?.writable} onSubmit={submit} onDraft={setDraft} onError={setError} onClose={() => { if (canLeave()) { setSelection(undefined); setDraft(false); } }} />
    </main>
    <footer><span className={diagnostics.length ? 'status-warning' : ''}>● {doc ? t(diagnostics.length ? 'diagnostics' : 'valid') : t('localHint')}{query && ` · ${t('search.scenarioMatches')}: ${scenarioMatches}`}</span>
      <label className="resize">{t('resize')}<input aria-label={t('resize')} type="range" min={340} max={560} value={width} onChange={(e) => setWidth(Number(e.target.value))} /></label><span>v0.2.0</span></footer>
    {diagnostics.length > 0 && <details className="diagnostic-details"><summary>{t('diagnostics')} ({diagnostics.length})</summary>{diagnostics.map((fault, index) => <p key={index}>{t(`error.${fault.code}`)} {fault.offset != null ? `(${fault.offset})` : ''}</p>)}</details>}
    {preview && doc && <Preview preview={preview.value} document={doc} busy={busy} t={t} cancel={() => setPreview(undefined)} apply={() => work(async () => { accept(await api.apply(doc.id, preview.value), preview.index); setNotice(t('notice.applied')); })} />}
    <FileDialogs help={help} setHelp={setHelp} t={t} locale={locale} busy={busy} recoveries={showRecovery ? recoveries : undefined} closeRecovery={() => setShowRecovery(false)} backups={backups} closeBackups={() => setBackups(undefined)}
      onRecover={(id) => { if ((doc?.dirty || draft) && !window.confirm(t('closeDirty'))) return; work(async () => { accept(await api.recover(id)); setShowRecovery(false); }); }}
      onRestore={(id) => { if (!doc || !window.confirm(t('restore.confirm'))) return; work(async () => { const result = await api.restore(doc, id); accept(result.document); setBackups(undefined); setNotice(`${t('backup')}: ${result.receipt.backup}`); }); }} />
  </div>;
}
