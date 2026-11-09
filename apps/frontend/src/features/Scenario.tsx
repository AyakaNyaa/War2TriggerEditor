import { useState } from 'react';
import type { CommandSpec, DocumentView, ScenarioBlock } from '../shared/generated';
import { blockMatches, conditionText, describe, sorted, type Translate } from '../shared/presentation';

type Props = { document: DocumentView; catalog: CommandSpec[]; query: string; t: Translate; locale: string; selected?: number;
  onSelect: (block: ScenarioBlock) => void; onInstruction: (index: number) => void; onNewRule: () => void; onBlock: (block: ScenarioBlock, action: string) => void; busy: boolean };

export function Scenario({ document, catalog, query, t, locale, selected, onSelect, onInstruction, onNewRule, onBlock, busy }: Props) {
  const [view, setView] = useState('execution');
  const [expanded, setExpanded] = useState<Set<number>>(new Set());
  const program = document.program;
  const blocks = program.blocks.filter((block) => block.depth === 0 && blockMatches(block, program, catalog, query, t));
  const group = (block: ScenarioBlock) => block.kind === 'rule' ? 'conditions' : catalog.find((s) => s.opcode === program.instructions[block.start]?.opcode)?.group ?? 'advanced';
  const render = (block: ScenarioBlock) => {
    const instruction = program.instructions[block.start];
    const isRule = block.kind === 'rule';
    const category = group(block);
    const isOpen = expanded.has(block.start);
    const descendants = program.blocks.filter((item) => item.start > block.start && item.end < block.end && item.depth === block.depth + 1);
    return <article className={`scenario-card group-${category} ${selected === block.start ? 'is-selected' : ''}`} key={block.start}>
      <button className="scenario-card-main" onClick={() => onSelect(block)} aria-label={`${t('scenario.edit')} ${isRule ? t('rule.title') : t(`command.${instruction.opcode}`)} ${block.start + 1}`}>
        <div className="scenario-card-heading"><span className="sequence-number">{String(block.start + 1).padStart(2, '0')}</span>
          <span className={`type-label ${isRule ? 'condition-label' : 'setting-label'}`}>{t(isRule ? 'rule.title' : `group.${category}`)}</span><span className="edit-hint">{t('scenario.edit')} ↗</span></div>
        {isRule && block.condition ? <><h3>{conditionText(block.condition, t, locale)}</h3><div className="action-chain"><span>{t('then')}</span>
          {block.action_indices.slice(0, 4).map((index) => <span className="action-pill" key={index}>{t(`command.${program.instructions[index].opcode}`)}</span>)}
          {block.action_indices.length > 4 && <span>+{block.action_indices.length - 4}</span>}</div></>
          : <><h3>{t(`command.${instruction.opcode}`)}</h3><p className="card-description">{describe(instruction, t) || t('field.noParameters')}</p></>}
      </button>
      <div className="card-footer"><button className="quiet" onClick={() => setExpanded((old) => { const next = new Set(old); if (next.has(block.start)) next.delete(block.start); else next.add(block.start); return next; })}>{isOpen ? '▾' : '▸'} {t('scenario.details')} · {block.end - block.start}</button>
        <div><button className="icon-button" disabled={busy || !document.writable} aria-label={`${t('duplicate')} ${block.start + 1}`} onClick={() => onBlock(block, 'duplicate')}>⧉</button>
          <button className="icon-button" disabled={busy || !document.writable} aria-label={`${t('up')} ${block.start + 1}`} onClick={() => onBlock(block, 'up')}>↑</button>
          <button className="icon-button" disabled={busy || !document.writable} aria-label={`${t('down')} ${block.start + 1}`} onClick={() => onBlock(block, 'down')}>↓</button>
          <button className="icon-button danger" disabled={busy || !document.writable} aria-label={`${t('delete')} ${block.start + 1}`} onClick={() => onBlock(block, 'delete')}>×</button></div></div>
      {isOpen && <div className="raw-instructions">{program.instructions.slice(block.start, block.end).map((item, i) => <button className="raw-command" key={i} onClick={() => onInstruction(block.start + i)}><span>{block.start + i + 1}</span><strong>{t(`command.${item.opcode}`)}</strong><small>{describe(item, t)}</small></button>)}
        {descendants.map((child) => <div className="nested-rule" key={child.start}><span className="type-label condition-label">{t('rule.nested')}</span>{child.condition && conditionText(child.condition, t)}</div>)}</div>}
    </article>;
  };
  return <section className="scenario-pane"><header className="scenario-header"><div><span className="eyebrow">{t('scenario.eyebrow')}</span><h2>{t('scenario.title')}</h2></div>
      <button className="gold" disabled={busy || !document.writable} onClick={onNewRule}>＋ {t('rule.new')}</button></header>
    <div className="scenario-controls"><span>{program.blocks.filter((b) => b.depth === 0).length} {t('scenario.elements')}</span>
      <label>{t('scenario.view')} <select value={view} onChange={(event) => setView(event.target.value)}>
        <option value="execution">{t('sort.execution')}</option><option value="groups">{t('sort.groups')}</option><option value="alphabet">{t('sort.alphabet')}</option></select></label></div>
    {view !== 'execution' && <p className="order-note">{t('scenario.orderNote')}</p>}
    {!document.writable && <p className="readonly">{t('readonly')}</p>}
    <div className="scenario-list">{view === 'groups' ? sorted([...new Set(blocks.map(group))], (key) => t(`group.${key}`), locale).map((key) => <section key={key} className="scenario-group"><h3><i className={`group-dot group-${key}`} />{t(`group.${key}`)}</h3>{blocks.filter((block) => group(block) === key).map(render)}</section>)
      : (view === 'alphabet' ? sorted(blocks, (block) => block.condition ? conditionText(block.condition, t) : t(`command.${program.instructions[block.start]?.opcode}`), locale) : blocks).map(render)}
      {!blocks.length && <div className="scenario-empty"><span aria-hidden="true">◇</span><h3>{t(query ? 'noResults' : 'scenario.emptyTitle')}</h3><p>{t(query ? 'search.emptyHint' : 'scenario.emptyBody')}</p>
        {!query && <button className="gold" disabled={busy || !document.writable} onClick={onNewRule}>{t('rule.new')}</button>}</div>}
    </div>
  </section>;
}
