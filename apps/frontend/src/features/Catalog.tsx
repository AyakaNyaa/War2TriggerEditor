import type { CommandSpec } from '../shared/generated';
import { useState } from 'react';
import { commandDescription, matches, sorted, type Translate } from '../shared/presentation';

type Props = { catalog: CommandSpec[]; query: string; group: string; onGroup: (group: string) => void;
  onChoose: (spec: CommandSpec) => void; onNewRule: () => void; locale: string; t: Translate; disabled: boolean };

export function Catalog({ catalog, query, group, onGroup, onChoose, onNewRule, locale, t, disabled }: Props) {
  const [manual, setManual] = useState(false);
  const available = catalog.filter((s) => s.kind !== 'structure' || manual && [22, 33, 125].includes(s.opcode));
  const groups = sorted([...new Set(available.map((s) => s.group ?? 'advanced'))], (g) => t(`group.${g}`), locale);
  const visible = sorted(available.filter((s) => (group === 'all' || s.group === group)
    && matches(query, t(s.name_key), t(`group.${s.group}`), commandDescription(s, t))), (s) => t(s.name_key), locale);
  return <aside className="catalog-pane">
    <div className="pane-title"><span className="eyebrow">{t('catalog.eyebrow')}</span><h2>{t('catalog.title')}</h2></div>
    <button className="new-rule-button" disabled={disabled} onClick={onNewRule}><span aria-hidden="true">＋</span><span>{t('rule.new')}<small>{t('rule.short')}</small></span></button>
    <nav className="category-list" aria-label={t('catalog.groups')}>
      <button className={group === 'all' ? 'active' : ''} onClick={() => onGroup('all')}>{t('catalog.all')}<span>{available.length}</span></button>
      {groups.map((key) => <button key={key} className={group === key ? 'active' : ''} onClick={() => onGroup(key)}>
        <i className={`group-dot group-${key}`} /><span>{t(`group.${key}`)}</span><small>{available.filter((s) => s.group === key).length}</small>
      </button>)}
    </nav>
    <label className="manual-toggle"><input type="checkbox" checked={manual} onChange={(e) => setManual(e.target.checked)} />{t('catalog.manual')}</label>
    <div className="catalog-results"><span className="section-label">{t('catalog.results')} · {visible.length} <span>{t('sort.alphabet')}</span></span>
      <div className="catalog-items">{visible.map((spec) => <button key={spec.opcode} data-opcode={spec.opcode} disabled={disabled} className={`catalog-item group-${spec.group}`} onClick={() => onChoose(spec)}>
        <span className="catalog-item-name">{t(spec.name_key)}</span><small>{commandDescription(spec, t)}</small>
        <span className="catalog-item-tag">{t(`group.${spec.group}`)}</span>
      </button>)}{!visible.length && <p className="muted">{t('noResults')}</p>}</div>
    </div>
  </aside>;
}
