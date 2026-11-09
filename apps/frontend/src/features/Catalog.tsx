import { useEffect, useRef, useState } from 'react';
import type { CommandSpec } from '../shared/generated';
import { commandDescription, matches, sorted, type Translate } from '../shared/presentation';

type Props = { catalog: CommandSpec[]; locale: string; t: Translate; disabled: boolean; initialQuery?: string;
  actionsOnly?: boolean; onChoose: (spec: CommandSpec) => void; onClose: () => void };

export function Catalog({ catalog, initialQuery = '', onChoose, onClose, locale, t, disabled, actionsOnly }: Props) {
  const [query, setQuery] = useState(initialQuery);
  const [group, setGroup] = useState('all');
  const [manual, setManual] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const search = useRef<HTMLInputElement>(null);
  useEffect(() => {
    const element = dialog.current!;
    const previous = document.activeElement as HTMLElement | null;
    element.showModal();
    search.current?.focus();
    return () => { element.close(); if (previous?.isConnected) previous.focus(); };
  }, []);
  const available = catalog.filter((s) => actionsOnly ? s.kind !== 'condition' && s.kind !== 'structure' && s.stage !== 'preload'
    : s.kind !== 'structure' || manual && [22, 33, 125].includes(s.opcode));
  const groups = sorted([...new Set(available.map((s) => s.group ?? 'advanced'))], (g) => t(`group.${g}`), locale);
  const visible = sorted(available.filter((s) => (group === 'all' || s.group === group)
    && matches(query, t(s.name_key), t(`group.${s.group}`), commandDescription(s, t))), (s) => t(s.name_key), locale);
  return <dialog ref={dialog} className="catalog-dialog" aria-labelledby="catalog-heading" onCancel={(event) => { event.preventDefault(); onClose(); }}
    onClick={(event) => { if (event.target === event.currentTarget) onClose(); }}>
    <div className="catalog-frame">
      <header className="catalog-heading"><div><h2 id="catalog-heading">{t(actionsOnly ? 'workbench.pickAction' : 'workbench.catalog')}</h2><p>{t('workbench.catalogHint')}</p></div>
        <button className="icon-button" aria-label={t('close')} onClick={onClose}>×</button></header>
      <div className="catalog-search"><span aria-hidden="true">⌕</span><input ref={search} type="search" aria-label={t('workbench.catalogSearch')} placeholder={t('workbench.catalogSearch')} value={query}
        onChange={(event) => { setQuery(event.target.value); setGroup('all'); }} onKeyDown={(event) => {
          if (event.key === 'ArrowDown') { event.preventDefault(); dialog.current?.querySelector<HTMLButtonElement>('.catalog-item')?.focus(); }
          if (event.key === 'Enter' && visible.length === 1) { event.preventDefault(); onChoose(visible[0]); }
        }} />{query && <button className="icon-button" aria-label={t('search.clear')} onClick={() => setQuery('')}>×</button>}</div>
      <div className="catalog-body"><nav className="category-list" aria-label={t('catalog.groups')}>
        <button aria-pressed={group === 'all'} onClick={() => setGroup('all')}><span>{t('catalog.all')}</span><small>{available.length}</small></button>
        {groups.map((key) => <button key={key} aria-pressed={group === key} onClick={() => setGroup(key)}>
          <i className={`group-dot group-${key}`} /><span>{t(`group.${key}`)}</span><small>{available.filter((s) => s.group === key).length}</small>
        </button>)}
      </nav><section className="catalog-results"><div className="catalog-result-count"><span>{t('catalog.results')} · {visible.length}</span><span>{t('sort.alphabet')} ↓</span></div>
        <div className="catalog-items">{visible.map((spec) => <button key={spec.opcode} data-opcode={spec.opcode} disabled={disabled} className={`catalog-item group-${spec.group}`} onClick={() => onChoose(spec)}>
          <i className={`group-dot group-${spec.group}`} /><span className="catalog-item-copy"><span className="catalog-item-name">{t(spec.name_key)}</span><small>{commandDescription(spec, t)}</small></span>
          <span className="catalog-item-tag">{t(`group.${spec.group}`)}</span><span className="catalog-item-arrow" aria-hidden="true">→</span>
        </button>)}{!visible.length && <div className="catalog-empty"><h3>{t('noResults')}</h3><p>{t('search.emptyHint')}</p><button onClick={() => { setQuery(''); setGroup('all'); }}>{t('search.clear')}</button></div>}</div>
      </section></div>
      <div className="catalog-footer">{!actionsOnly && <label className="manual-toggle"><input type="checkbox" checked={manual} onChange={(e) => setManual(e.target.checked)} />{t('catalog.manual')}</label>}
        <span><kbd>Esc</kbd> {t('workbench.dismiss')}</span></div>
    </div>
  </dialog>;
}
