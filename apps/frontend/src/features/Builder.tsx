import { useEffect, useRef, useState } from 'react';
import { api } from '../shared/api';
import { CommandFields } from '../shared/CommandFields';
import { commandDescription, conditionText, type Translate } from '../shared/presentation';
import type { CommandDraftRequest, CommandSpec, Instruction, RuleCondition } from '../shared/generated';
import { ConditionFields, initialCondition } from './ConditionFields';
import { Catalog } from './Catalog';

export type BuilderSelection = { key: number; mode: 'rule' | 'command'; index: number; replaceEnd?: number;
  instruction?: Instruction; condition?: RuleCondition; actions?: Instruction[]; opcode?: number };
export type BuilderValue = { selection: BuilderSelection; condition: RuleCondition; actions: CommandDraftRequest[] };

type Props = { selection?: BuilderSelection; catalog: CommandSpec[]; locale: string; t: Translate; busy: boolean;
  onSubmit: (value: BuilderValue, preview: boolean) => void; onDraft: (dirty: boolean) => void; onError: (code: string) => void;
  onClose: () => void; onNewRule: () => void; onCatalog: () => void };
const toDraft = (instruction: Instruction): CommandDraftRequest => ({ opcode: instruction.opcode,
  values: instruction.fields.map((field) => field.value), text: instruction.text });
const signature = (condition: RuleCondition, actions: Instruction[]) => JSON.stringify({ condition, actions: actions.map(toDraft) });

export function Builder({ selection, catalog, locale, t, busy, onSubmit, onDraft, onError, onClose, onNewRule, onCatalog }: Props) {
  const [condition, setCondition] = useState(initialCondition);
  const [actions, setActions] = useState<Instruction[]>([]);
  const [picker, setPicker] = useState<number>();
  const [focusAction, setFocusAction] = useState<number>();
  const [loading, setLoading] = useState(false);
  const [initial, setInitial] = useState('');
  const generation = useRef(0);
  const scroll = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const current = ++generation.current;
    setPicker(undefined); setFocusAction(undefined); setInitial('');
    if (!selection) { setActions([]); onDraft(false); return; }
    const nextCondition = selection.condition ?? initialCondition();
    setCondition(nextCondition); setActions([]); setLoading(true);
    const load = selection.actions ? Promise.resolve(selection.actions) : selection.instruction ? Promise.resolve([selection.instruction])
      : api.draft({ opcode: selection.opcode ?? 24 }).then((instruction) => [instruction]);
    load.then((next) => { if (generation.current === current) { setActions(next); setInitial(signature(nextCondition, next)); } })
      .catch((error) => onError(error.message)).finally(() => { if (generation.current === current) setLoading(false); });
    return () => { generation.current++; };
  }, [selection?.key]);
  const dirty = Boolean(selection && initial && signature(condition, actions) !== initial);
  useEffect(() => { onDraft(dirty); }, [dirty, onDraft]);
  useEffect(() => {
    if (focusAction == null || loading) return;
    const action = scroll.current?.querySelector<HTMLElement>(`[data-action-index="${focusAction}"]`);
    if (action) { action.scrollIntoView({ block: 'start' }); (action.querySelector<HTMLElement>('input, select, textarea') ?? action).focus({ preventScroll: true }); }
    setFocusAction(undefined);
  }, [focusAction, loading]);
  if (!selection) return <section className="builder-pane builder-welcome">
    <div className="builder-start"><span className="start-icon" aria-hidden="true">◇</span><h2>{t('workbench.startTitle')}</h2><p>{t('workbench.startBody')}</p>
      <div className="welcome-actions"><button className="gold" disabled={busy} onClick={onNewRule}>＋ {t('rule.new')}</button><button disabled={busy} onClick={onCatalog}>{t('workbench.catalog')}</button></div>
      <div className="start-example"><span className="type-label condition-label">{t('when')}</span><p>{t('workbench.exampleWhen')}</p><span aria-hidden="true">→</span><span className="type-label action-label">{t('then')}</span><p>{t('command.24')}</p></div>
    </div>
  </section>;
  const isRule = selection.mode === 'rule';
  const existing = selection.replaceEnd != null || selection.instruction != null;
  const isSetting = !isRule && catalog.find((s) => s.opcode === actions[0]?.opcode)?.kind === 'setting';
  const title = isRule ? t('builder.ruleTitle') : actions[0] ? t(`command.${actions[0].opcode}`) : t('builder.commandTitle');
  const submit = (preview: boolean) => onSubmit({ selection, condition, actions: actions.map(toDraft) }, preview);
  const changeAction = (index: number, values: number[], text: string) => {
    const original = actions[index];
    const operationChanged = original.fields.some((field, i) => field.label_key === 'operation' && field.value !== values[i]);
    if (operationChanged) {
      setLoading(true); const current = generation.current;
      api.draft({ opcode: original.opcode, values, text: original.text == null ? null : text }).then((next) => {
        if (current === generation.current) setActions((old) => old.map((item, i) => i === index ? next : item));
      }).catch((error) => onError(error.message)).finally(() => { if (current === generation.current) setLoading(false); });
    } else setActions((old) => old.map((item, i) => i === index ? { ...item,
      fields: item.fields.map((field, n) => ({ ...field, value: values[n] })), text: item.text == null ? null : text } : item));
  };
  const pickAction = (spec: CommandSpec) => {
    const index = picker!; setPicker(undefined); setLoading(true); const current = generation.current;
    api.draft({ opcode: spec.opcode }).then((next) => { if (generation.current === current) { setActions((old) => index < old.length ? old.map((item, i) => i === index ? next : item) : [...old, next]); setFocusAction(index); } })
      .catch((error) => onError(error.message)).finally(() => { if (generation.current === current) setLoading(false); });
  };
  const moveAction = (index: number, direction: number) => setActions((old) => {
    const next = [...old]; [next[index], next[index + direction]] = [next[index + direction], next[index]]; return next;
  });
  return <section className="builder-pane">
    <header className="builder-heading"><div><span className="eyebrow">{t(existing ? 'builder.edit' : 'builder.new')}</span><h2>{title}</h2></div>
      <button className="quiet" onClick={onClose}>{t('workbench.closeEditor')} ×</button></header>
    <form className="builder-form" onSubmit={(event) => { event.preventDefault(); submit(false); }}>
      <div className="builder-scroll" ref={scroll} key={selection.key}><fieldset disabled={busy || loading}>
        <div className={`builder-grid ${isRule ? '' : 'command-only'}`}>
          {isRule && <ConditionFields value={condition} change={setCondition} locale={locale} t={t} />}
          <section className="actions-section"><div className="section-heading"><span className={`type-label ${isRule ? 'action-label' : 'setting-label'}`}>{t(isRule ? 'then' : 'setting')}</span><h3>{t(isRule ? 'rule.actions' : 'builder.parameters')}</h3>
            {isRule && <button className="quiet add-action-top" type="button" onClick={() => setPicker(actions.length)}>＋ {t('action.add')}</button>}</div>
            {actions.map((instruction, index) => {
              const spec = catalog.find((s) => s.opcode === instruction.opcode);
              return <article className="action-editor" data-action-index={index} tabIndex={-1} key={`${index}-${instruction.opcode}`}>
                <header><span className="action-number">{index + 1}</span><h4>{t(`command.${instruction.opcode}`)}</h4>{isRule && <div className="action-tools">
                  <button type="button" className="quiet" aria-label={`${t('workbench.changeAction')} ${index + 1}`} onClick={() => setPicker(index)}>{t('workbench.change')}</button>
                  {actions.length > 1 && <><button type="button" className="icon-button" disabled={index === 0} aria-label={`${t('workbench.actionUp')} ${index + 1}`} onClick={() => moveAction(index, -1)}>↑</button>
                    <button type="button" className="icon-button" disabled={index === actions.length - 1} aria-label={`${t('workbench.actionDown')} ${index + 1}`} onClick={() => moveAction(index, 1)}>↓</button></>}
                  {actions.length > 1 && <button type="button" className="icon-button danger" aria-label={`${t('action.remove')} ${index + 1}`} onClick={() => setActions(actions.filter((_, i) => i !== index))}>×</button>}</div>}</header>
                {spec && <p className="action-description">{commandDescription(spec, t)}</p>}
                <CommandFields instruction={instruction} values={instruction.fields.map((f) => f.value)} text={instruction.text ?? ''}
                  prefix={`builder-${index}`} locale={locale} t={t} onChange={(values, text) => changeAction(index, values, text)} />
                {spec?.stage === 'preload' && <p className="field-hint">{t('builder.preload')}</p>}
              </article>;
            })}
            {isRule && <button type="button" className="add-action" onClick={() => setPicker(actions.length)}>＋ {t('action.add')}</button>}
          </section>
        </div>
      </fieldset></div>
      <div className="builder-submit"><div className="rule-summary"><strong>{t(isRule ? 'rule.summary' : 'builder.parameters')}</strong>
        <p>{isRule ? <>{conditionText(condition, t, locale)} <span className="summary-arrow">→</span> {actions.map((action) => t(`command.${action.opcode}`)).join(' → ')}</> : t('builder.fileNote')}</p></div>
        <div className="submit-actions"><button className="quiet" type="button" disabled={busy || loading || !actions.length} onClick={(event) => { if (event.currentTarget.form?.reportValidity()) submit(true); }}>{t('builder.preview')}</button>
          <button className="gold" type="submit" disabled={busy || loading || !actions.length}>{loading || busy ? t('pending') : t(existing ? 'builder.apply' : isRule ? 'builder.addRule' : isSetting ? 'builder.addSetting' : 'builder.addCommand')}</button></div>
      </div>
    </form>
    {picker != null && <Catalog catalog={catalog} actionsOnly locale={locale} t={t} disabled={busy || loading} onChoose={pickAction} onClose={() => setPicker(undefined)} />}
  </section>;
}
