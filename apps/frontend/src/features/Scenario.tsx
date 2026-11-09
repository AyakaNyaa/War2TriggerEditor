import { useState } from 'react';
import type { CommandSpec, DocumentView, ScenarioBlock } from '../shared/generated';
import { blockMatches, conditionText, describe, sorted, type Translate } from '../shared/presentation';

type Props = { document: DocumentView; catalog: CommandSpec[]; query: string; t: Translate; locale: string; selected?: number;
  onSelect: (block: ScenarioBlock) => void; onInstruction: (index: number) => void; onNewRule: () => void;
  onCatalog: () => void; onBlock: (block: ScenarioBlock, action: string) => void; busy: boolean };

export function Scenario({ document, catalog, query, t, locale, selected, onSelect, onInstruction, onNewRule, onCatalog, onBlock, busy }: Props) {
  const [view, setView] = useState('execution');
  const [expanded, setExpanded] = useState<Set<number>>(new Set());
  const program = document.program;
  const roots = program.blocks.filter((block) => block.depth === 0);
  const blocks = roots.filter((block) => blockMatches(block, program, catalog, query, t));
  const group = (block: ScenarioBlock) => block.kind === 'rule' ? 'conditions' : catalog.find((s) => s.opcode === program.instructions[block.start]?.opcode)?.group ?? 'advanced';
  const render = (block: ScenarioBlock) => {
    const instruction = program.instructions[block.start];
    const isRule = block.kind === 'rule';
    const category = group(block);
    const isOpen = expanded.has(block.start);
    const position = roots.indexOf(block);
    const descendants = program.blocks.filter((item) => item.start > block.start && item.end < block.end && item.depth === block.depth + 1);
    return <article className={`scenario-card group-${category} ${selected === block.start ? 'is-selected' : ''}`} key={block.start}>
      <button className="scenario-card-main" aria-pressed={selected === block.start} onClick={() => onSelect(block)} aria-label={`${t('scenario.edit')} ${isRule ? t('rule.title') : t(`command.${instruction.opcode}`)} ${position + 1}`}>
        <div className="scenario-card-heading"><span className="sequence-number">{String(position + 1).padStart(2, '0')}</span><span>{t(isRule ? 'rule.title' : `group.${category}`)}</span><i className={`group-dot group-${category}`} /></div>
        {isRule && block.condition ? <><h3>{block.action_indices.slice(0, 2).map((index) => t(`command.${program.instructions[index].opcode}`)).join(' + ')}{block.action_indices.length > 2 && ` +${block.action_indices.length - 2}`}</h3><p className="card-description" title={conditionText(block.condition, t, locale)}>{conditionText(block.condition, t, locale)}</p></>
          : <><h3>{t(`command.${instruction.opcode}`)}</h3><p className="card-description" title={describe(instruction, t)}>{describe(instruction, t) || t('field.noParameters')}</p></>}
      </button>
      <div className="card-footer"><button className="quiet" aria-expanded={isOpen} onClick={() => setExpanded((old) => { const next = new Set(old); if (next.has(block.start)) next.delete(block.start); else next.add(block.start); return next; })}>{isOpen ? '▾' : '▸'} {t('workbench.commands')} ({block.end - block.start})</button>
        <div className="block-tools"><button className="icon-button" disabled={busy || !document.writable} aria-label={`${t('duplicate')} ${position + 1}`} title={t('duplicate')} onClick={() => onBlock(block, 'duplicate')}>⧉</button>
          <button className="icon-button" disabled={busy || !document.writable || position === 0} aria-label={`${t('up')} ${position + 1}`} title={t('up')} onClick={() => onBlock(block, 'up')}>↑</button>
          <button className="icon-button" disabled={busy || !document.writable || position === roots.length - 1} aria-label={`${t('down')} ${position + 1}`} title={t('down')} onClick={() => onBlock(block, 'down')}>↓</button>
          <button className="icon-button danger" disabled={busy || !document.writable} aria-label={`${t('delete')} ${position + 1}`} title={t('delete')} onClick={() => onBlock(block, 'delete')}>×</button></div></div>
      {isOpen && <div className="raw-instructions">{program.instructions.slice(block.start, block.end).map((item, i) => <button className="raw-command" key={i} onClick={() => onInstruction(block.start + i)}><span>{i + 1}</span><strong>{t(`command.${item.opcode}`)}</strong><small>{describe(item, t)}</small></button>)}
        {descendants.map((child) => <div className="nested-rule" key={child.start}><span className="type-label condition-label">{t('rule.nested')}</span>{child.condition && conditionText(child.condition, t)}</div>)}</div>}
    </article>;
  };
  return <aside className="scenario-pane" aria-label={t('scenario.title')}><header className="scenario-header"><h2>{t('scenario.title')} <span>{roots.length}</span></h2>
      <button className="gold" disabled={busy || !document.writable} onClick={onNewRule}>＋ {t('rule.new')}</button></header>
    <div className="scenario-controls"><label>{t('scenario.view')} <select value={view} onChange={(event) => setView(event.target.value)}>
      <option value="execution">{t('sort.execution')}</option><option value="groups">{t('sort.groups')}</option><option value="alphabet">{t('sort.alphabet')}</option></select></label></div>
    {view !== 'execution' && <p className="order-note">{t('workbench.viewOnly')}</p>}
    {!document.writable && <p className="readonly">{t('readonly')}</p>}
    <div className="scenario-list">{view === 'groups' ? sorted([...new Set(blocks.map(group))], (key) => t(`group.${key}`), locale).map((key) => <section key={key} className="scenario-group"><h3><i className={`group-dot group-${key}`} />{t(`group.${key}`)}</h3>{blocks.filter((block) => group(block) === key).map(render)}</section>)
      : (view === 'alphabet' ? sorted(blocks, (block) => block.condition ? conditionText(block.condition, t) : t(`command.${program.instructions[block.start]?.opcode}`), locale) : blocks).map(render)}
      {!blocks.length && <div className="scenario-empty"><h3>{t(query ? 'noResults' : 'workbench.emptyOutline')}</h3><p>{t(query ? 'search.emptyHint' : 'workbench.outlineHint')}</p>
        {!query && <button disabled={busy || !document.writable} onClick={onNewRule}>＋ {t('rule.new')}</button>}</div>}
    </div><div className="scenario-bottom"><button disabled={busy || !document.writable} onClick={onCatalog}>＋ {t('workbench.addFromCatalog')}</button></div>
  </aside>;
}
