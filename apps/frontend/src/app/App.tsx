import { useEffect, useRef, useState } from 'react';
import { api } from '../shared/api';
import { translator, type Locale } from '../shared/i18n';
import { blockMatches, matches, commandDescription } from '../shared/presentation';
import type { BackupEntry, ChangePreview, CommandSpec, DocumentView, RecoveryEntry, ScenarioBlock } from '../shared/generated';
import { Catalog } from '../features/Catalog';
import { Builder, type BuilderSelection, type BuilderValue } from '../features/Builder';
import { Scenario } from '../features/Scenario';
import { Preview } from '../features/Preview';
import { initialCondition } from '../features/ConditionFields';
import { FileDialogs } from './FileDialogs';
import { AppChrome } from './AppChrome';

export function App() {
  const [locale, setLocale] = useState<Locale>(localStorage.getItem('war2.locale') === 'en' ? 'en' : 'ru');
  const [doc, setDoc] = useState<DocumentView>();
  const [catalog, setCatalog] = useState<CommandSpec[]>([]);
  const [query, setQuery] = useState('');
  const [catalogOpen, setCatalogOpen] = useState(false);
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
  const counter = useRef(0);
  const search = useRef<HTMLInputElement>(null);
  const t = translator(locale);
  const diagnostics = [...(doc?.diagnostics ?? []), ...(doc?.program.diagnostics ?? [])];
  useEffect(() => { api.catalog().then(setCatalog).catch(() => setError('api.unavailable')); api.recoveries().then(setRecoveries).catch(() => {}); }, []);
  useEffect(() => { document.documentElement.lang = locale; localStorage.setItem('war2.locale', locale); setNotice(''); }, [locale]);
  useEffect(() => { if (!notice) return; const timer = window.setTimeout(() => setNotice(''), 5000); return () => window.clearTimeout(timer); }, [notice]);
  useEffect(() => {
    const unload = (event: BeforeUnloadEvent) => { if (doc?.dirty || draft) { event.preventDefault(); event.returnValue = ''; } };
    window.addEventListener('beforeunload', unload); return () => window.removeEventListener('beforeunload', unload);
  }, [doc?.dirty, draft]);
  useEffect(() => {
    const keys = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); (document.querySelector<HTMLInputElement>('dialog[open] input[type=search]') ?? search.current)?.focus(); }
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
    const block = next.program.blocks.find((b) => b.start === (index ?? selection?.index) && b.depth === 0) ?? next.program.blocks.find((b) => b.depth === 0);
    if (block) chooseBlock(next, block, false); else setSelection(undefined);
  };
  function open(action: () => Promise<DocumentView>) {
    if ((doc?.dirty || draft) && !window.confirm(t('closeDirty'))) return;
    work(async () => { const next = await action(); setDoc(next); setSelection(undefined); setDraft(false); setQuery(''); setNotice(t('notice.opened')); const first = next.program.blocks.find((b) => b.depth === 0); if (first) chooseBlock(next, first, false); });
  }
  function newRule() {
    if (!doc || !canLeave()) return;
    setSelection({ key: ++counter.current, mode: 'rule', index: doc.program.instructions.length }); setDraft(false);
  }
  function choose(spec: CommandSpec) {
    if (!doc || !canLeave()) return;
    setCatalogOpen(false); setQuery('');
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
  const catalogMatches = catalog.filter((spec) => spec.kind !== 'structure' && matches(query, t(spec.name_key), t(`group.${spec.group}`), commandDescription(spec, t))).length;
  const showCatalog = () => setCatalogOpen(true);
  return <div className="app-shell">
    <AppChrome document={doc} busy={busy} draft={draft} query={query} catalogMatches={catalogMatches} recoveries={recoveries.length} locale={locale} t={t} search={search}
      onLocale={setLocale} onQuery={setQuery} onOpen={() => open(api.open)} onNew={() => open(api.create)} onImport={(file) => open(() => api.import(file))}
      onSave={save} onHistory={(redo) => { if (doc && canLeave()) work(async () => accept(await api.history(doc, redo))); }}
      onBackups={() => { if (doc) work(async () => setBackups(await api.backups(doc.id))); }} onHelp={() => setHelp(true)} onCatalog={showCatalog}
      onRecovery={() => work(async () => { setRecoveries(await api.recoveries()); setShowRecovery(true); })} />
    {error && error !== 'dialog.cancelled' && <div className="message error" role="alert">{t(errorKey) === errorKey ? t('error.generic') : t(errorKey)}<button className="icon-button" onClick={() => setError('')} aria-label={t('close')}>×</button></div>}
    {busy && <div className="loading-bar" aria-label={t('pending')} />}
    <main className={`workspace ${!doc ? 'no-document' : ''}`}>
      {doc ? <><Scenario document={doc} catalog={catalog} query={query} locale={locale} t={t} selected={selection?.index} busy={busy} onSelect={(block) => chooseBlock(doc, block)} onInstruction={(index) => {
        if (canLeave()) { setSelection({ key: ++counter.current, mode: 'command', index, instruction: doc.program.instructions[index] }); setDraft(false); }
      }} onNewRule={newRule} onCatalog={showCatalog} onBlock={(block, action) => {
        if (!canLeave()) return; work(async () => { const result = await api.blockPreview(doc.id, { expected_revision: doc.revision, start: block.start, action }); accept(await api.apply(doc.id, result), action === 'duplicate' ? block.end : block.start); setNotice(t('notice.applied')); });
      }} />
        <Builder selection={selection} catalog={catalog} locale={locale} t={t} busy={busy || !doc.writable} onSubmit={submit} onDraft={setDraft} onError={setError} onNewRule={newRule} onCatalog={showCatalog}
          onClose={() => { if (canLeave()) { setSelection(undefined); setDraft(false); } }} />
      </> : <section className="welcome"><div className="welcome-copy"><span className="eyebrow">WARCRAFT II</span><h2>{t('workbench.welcomeTitle')}</h2><p>{t('welcome.body')}</p>
        <div className="welcome-actions"><button className="gold" disabled={busy} onClick={() => open(api.open)}>{t('open')}</button><button disabled={busy} onClick={() => open(api.create)}>{t('newfile')}</button></div>
        <div className="welcome-example"><div><span className="type-label condition-label">{t('when')}</span><p>{t('workbench.exampleWhen')}</p></div><span aria-hidden="true">→</span><div><span className="type-label action-label">{t('then')}</span><p>{t('command.24')}</p></div></div>
      </div></section>}
    </main>
    {diagnostics.length > 0 && <details className="diagnostic-details"><summary>{t('diagnostics')} ({diagnostics.length})</summary>{diagnostics.map((fault, index) => <p key={index}>{t(`error.${fault.code}`)} {fault.offset != null ? `(${fault.offset})` : ''}</p>)}</details>}
    <footer className="app-status"><span className={diagnostics.length ? 'status-warning' : ''}>● {doc ? t(diagnostics.length ? 'diagnostics' : 'valid') : t('localHint')}{query && ` · ${t('search.scenarioMatches')}: ${scenarioMatches}`}</span>
      {notice && <span className="status-notice" role="status" title={notice}>✓ {notice}</span>}
      <span>{doc && `${doc.program.length ?? '—'} ${doc.kind === 'pud' ? `/ ${doc.capacity.toLocaleString()}` : ''} ${t('bytes')} · `}v0.3.0</span></footer>
    {catalogOpen && <Catalog catalog={catalog} initialQuery={query} locale={locale} t={t} disabled={busy || !doc?.writable} onChoose={choose} onClose={() => setCatalogOpen(false)} />}
    {preview && doc && <Preview preview={preview.value} document={doc} busy={busy} t={t} cancel={() => setPreview(undefined)} apply={() => work(async () => { accept(await api.apply(doc.id, preview.value), preview.index); setNotice(t('notice.applied')); })} />}
    <FileDialogs help={help} setHelp={setHelp} t={t} locale={locale} busy={busy} recoveries={showRecovery ? recoveries : undefined} closeRecovery={() => setShowRecovery(false)} backups={backups} closeBackups={() => setBackups(undefined)}
      onRecover={(id) => { if ((doc?.dirty || draft) && !window.confirm(t('closeDirty'))) return; work(async () => { accept(await api.recover(id)); setShowRecovery(false); }); }}
      onRestore={(id) => { if (!doc || !window.confirm(t('restore.confirm'))) return; work(async () => { const result = await api.restore(doc, id); accept(result.document); setBackups(undefined); setNotice(`${t('backup')}: ${result.receipt.backup}`); }); }} />
  </div>;
}
