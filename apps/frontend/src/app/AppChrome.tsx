import { useEffect, useRef, type RefObject } from 'react';
import type { DocumentView } from '../shared/generated';
import type { Locale } from '../shared/i18n';
import type { Translate } from '../shared/presentation';
import { Icon } from '../shared/Icon';

type Props = { document?: DocumentView; busy: boolean; draft: boolean; query: string; catalogMatches: number; recoveries: number;
  locale: Locale; t: Translate; search: RefObject<HTMLInputElement | null>; onLocale: (locale: Locale) => void;
  onQuery: (query: string) => void; onOpen: () => void; onNew: () => void; onImport: (file: File) => void;
  onSave: (saveAs: boolean) => void; onHistory: (redo: boolean) => void; onBackups: () => void;
  onRecovery: () => void; onHelp: () => void; onCatalog: () => void };

export function AppChrome({ document: doc, busy, draft, query, catalogMatches, recoveries, locale, t, search, onLocale,
  onQuery, onOpen, onNew, onImport, onSave, onHistory, onBackups, onRecovery, onHelp, onCatalog }: Props) {
  const input = useRef<HTMLInputElement>(null);
  const more = useRef<HTMLDetailsElement>(null);
  useEffect(() => {
    const dismiss = (event: PointerEvent) => { if (more.current && !more.current.contains(event.target as Node)) more.current.open = false; };
    const escape = (event: KeyboardEvent) => { if (event.key === 'Escape' && more.current?.open) { more.current.open = false; more.current.querySelector<HTMLElement>('summary')?.focus(); } };
    window.addEventListener('pointerdown', dismiss); window.addEventListener('keydown', escape);
    return () => { window.removeEventListener('pointerdown', dismiss); window.removeEventListener('keydown', escape); };
  }, []);
  const menuAction = (action: () => void) => { if (more.current) more.current.open = false; action(); };
  return <>
    <header className="topbar"><div className="brand"><span className="brand-mark" aria-hidden="true">WⅡ</span><h1>{t('app.title')}</h1></div>
      {doc && <div className="document-bar"><span className="file-kind">{doc.kind.toUpperCase()}</span><h2 title={doc.name}>{doc.name}</h2>
        <span className={`document-state ${doc.dirty || draft ? 'dirty' : ''}`}>{t(draft ? 'draft' : doc.dirty ? 'unsaved' : 'saved')}</span></div>}
      <div className="topbar-right"><button className="quiet" onClick={onHelp}>{t('help')}</button><select aria-label="Language / Язык" value={locale} onChange={(event) => onLocale(event.target.value as Locale)}><option value="ru">Русский</option><option value="en">English</option></select></div>
    </header>
    <nav className="toolbar" aria-label={t('workbench.toolbar')}><div className="toolbar-group">
      <button disabled={busy} onClick={onOpen}><Icon name="folder" />{t('open')}</button><button className="new-document" disabled={busy} onClick={onNew}><Icon name="plus" />{t('newfile')}</button>
      <button className="gold" disabled={busy || !doc?.writable} onClick={() => onSave(false)}><Icon name="save" />{t('save')}</button>
      <span className="toolbar-divider" /><button className="icon-button" aria-label={t('undo')} title={t('undo')} disabled={busy || !doc?.writable} onClick={() => onHistory(false)}><Icon name="undo" /></button>
      <button className="icon-button" aria-label={t('redo')} title={t('redo')} disabled={busy || !doc?.writable} onClick={() => onHistory(true)}><Icon name="redo" /></button>
    </div><div className="toolbar-group"><button disabled={busy || !doc?.writable} onClick={onCatalog}><Icon name="catalog" />{t('workbench.catalog')}</button>
      <details className="more-menu" ref={more}><summary role="button" aria-label={t('workbench.more')}>{t('workbench.more')} ▾</summary><div className="more-menu-items">
        <button className="more-new-document" disabled={busy} onClick={() => menuAction(onNew)}>{t('newfile')}</button>
        <button disabled={busy} onClick={() => menuAction(() => input.current?.click())}>{t('import')}</button>
        <button disabled={busy || !doc} onClick={() => menuAction(() => onSave(true))}>{t('saveAs')}</button>
        <button disabled={busy || !doc} onClick={() => menuAction(onBackups)}>{t('backups')}</button>
        <button disabled={busy} onClick={() => menuAction(onRecovery)}>{t('recoveries')}{recoveries ? ` (${recoveries})` : ''}</button>
      </div></details>
    </div><div className="global-search"><Icon name="search" /><input ref={search} aria-label={t('search.global')} placeholder={t('search.global')} value={query} onChange={(event) => onQuery(event.target.value)} /><kbd>Ctrl K</kbd>
      {query && <><button className="search-catalog" disabled={!doc?.writable} onClick={onCatalog}>{t('catalog.title')}: {catalogMatches}</button><button className="icon-button" aria-label={t('search.clear')} onClick={() => onQuery('')}>×</button></>}
    </div></nav>
    <input ref={input} aria-label={t('import')} hidden type="file" accept=".pud,.w2tr" onChange={(event) => { const file = event.target.files?.[0]; if (file) onImport(file); event.target.value = ''; }} />
  </>;
}
