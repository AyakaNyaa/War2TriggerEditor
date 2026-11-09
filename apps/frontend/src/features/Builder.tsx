import { useEffect, useRef, useState } from 'react';
import { api } from '../shared/api';
import { CommandFields } from '../shared/CommandFields';
import { commandDescription, conditionText, sorted, type Translate } from '../shared/presentation';
import type { CommandDraftRequest, CommandSpec, Instruction, RuleCondition } from '../shared/generated';
import { ConditionFields, initialCondition } from './ConditionFields';

export type BuilderSelection = { key: number; mode: 'rule' | 'command'; index: number; replaceEnd?: number;
  instruction?: Instruction; condition?: RuleCondition; actions?: Instruction[]; opcode?: number };
export type BuilderValue = { selection: BuilderSelection; condition: RuleCondition; actions: CommandDraftRequest[] };
type Props = { selection?: BuilderSelection; catalog: CommandSpec[]; locale: string; t: Translate; busy: boolean;
  onSubmit: (value: BuilderValue, preview: boolean) => void; onDraft: (dirty: boolean) => void; onError: (code: string) => void; onClose: () => void };

const toDraft = (instruction: Instruction): CommandDraftRequest => ({ opcode: instruction.opcode,
  values: instruction.fields.map((field) => field.value), text: instruction.text });
const signature = (condition: RuleCondition, actions: Instruction[]) => JSON.stringify({ condition, actions: actions.map(toDraft) });

export function Builder({ selection, catalog, locale, t, busy, onSubmit, onDraft, onError, onClose }: Props) {
  const [condition, setCondition] = useState(initialCondition);
  const [actions, setActions] = useState<Instruction[]>([]);
  const [actionOpcode, setActionOpcode] = useState(24);
  const [loading, setLoading] = useState(false);
  const [initial, setInitial] = useState('');
  const generation = useRef(0);
  useEffect(() => {
    const current = ++generation.current;
    if (!selection) { setActions([]); onDraft(false); return; }
    const nextCondition = selection.condition ?? initialCondition();
    setCondition(nextCondition); setLoading(true);
    const load = selection.actions ? Promise.resolve(selection.actions) : selection.instruction ? Promise.resolve([selection.instruction])
      : api.draft({ opcode: selection.opcode ?? 24 }).then((instruction) => [instruction]);
    load.then((next) => { if (generation.current === current) { setActions(next); setInitial(signature(nextCondition, next)); } })
      .catch((error) => onError(error.message)).finally(() => { if (generation.current === current) setLoading(false); });
    return () => { generation.current++; };
  }, [selection?.key]);
  const dirty = Boolean(selection && initial && signature(condition, actions) !== initial);
  useEffect(() => { onDraft(dirty); }, [dirty, onDraft]);
  if (!selection) return <aside className="builder-pane builder-welcome">
    <span className="builder-emblem" aria-hidden="true">◇</span><h2>{t('builder.emptyTitle')}</h2><p>{t('builder.emptyBody')}</p>
    <div className="legend"><span className="type-label condition-label">{t('when')}</span><span>→</span><span className="type-label action-label">{t('then')}</span></div>
  </aside>;
  const isRule = selection.mode === 'rule';
  const existing = selection.replaceEnd != null || selection.instruction != null;
  const isSetting = !isRule && catalog.find((s) => s.opcode === actions[0]?.opcode)?.kind === 'setting';
  const options = sorted(catalog.filter((s) => s.kind !== 'condition' && s.kind !== 'structure' && s.stage !== 'preload'), (s) => t(s.name_key), locale);
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
  return <aside className="builder-pane">
    <header className="builder-heading"><div><span className="eyebrow">{t(existing ? 'builder.edit' : 'builder.new')}</span><h2>{t(isRule ? 'builder.ruleTitle' : isSetting ? 'builder.settingTitle' : 'builder.commandTitle')}</h2></div>
      <button className="icon-button" aria-label={t('close')} onClick={onClose}>×</button></header>
    <form className="builder-form" onSubmit={(event) => { event.preventDefault(); submit(false); }}>
      <fieldset disabled={busy || loading}>
        {isRule && <ConditionFields value={condition} change={setCondition} locale={locale} t={t} />}
        <section className="actions-section"><div className="section-heading"><span className={`type-label ${isRule ? 'action-label' : 'setting-label'}`}>{t(isRule ? 'then' : 'setting')}</span><h3>{t(isRule ? 'rule.actions' : 'builder.parameters')}</h3></div>
          {actions.map((instruction, index) => {
            const spec = catalog.find((s) => s.opcode === instruction.opcode);
            return <article className="action-editor" key={`${index}-${instruction.opcode}`}>
              <header><h4>{t(`command.${instruction.opcode}`)}</h4>{isRule && actions.length > 1 && <button type="button" className="icon-button" aria-label={`${t('action.remove')} ${index + 1}`} onClick={() => setActions(actions.filter((_, i) => i !== index))}>×</button>}</header>
              {isRule && <div className="field"><label htmlFor={`action-kind-${index}`}>{t('action.type')} {index + 1}</label><select id={`action-kind-${index}`} value={instruction.opcode} onChange={(event) => {
                setLoading(true); const current = generation.current;
                api.draft({ opcode: Number(event.target.value) }).then((next) => { if (generation.current === current) setActions((old) => old.map((item, i) => i === index ? next : item)); })
                  .catch((error) => onError(error.message)).finally(() => { if (generation.current === current) setLoading(false); });
              }}>{options.map((option) => <option key={option.opcode} value={option.opcode}>{t(option.name_key)}</option>)}</select></div>}
              {spec && <p className="action-description">{commandDescription(spec, t)}</p>}
              <CommandFields instruction={instruction} values={instruction.fields.map((f) => f.value)} text={instruction.text ?? ''}
                prefix={`builder-${index}`} locale={locale} t={t} onChange={(values, text) => changeAction(index, values, text)} />
              {spec?.stage === 'preload' && <p className="field-hint">{t('builder.preload')}</p>}
            </article>;
          })}
          {isRule && <div className="add-action"><label htmlFor="builder-action-kind">{t('action.choose')}</label>
            <div><select id="builder-action-kind" value={actionOpcode} onChange={(e) => setActionOpcode(Number(e.target.value))}>
              {options.map((spec) => <option key={spec.opcode} value={spec.opcode}>{t(spec.name_key)}</option>)}</select>
              <button type="button" className="icon-button" aria-label={t('action.add')} onClick={() => {
                setLoading(true); const current = generation.current;
                api.draft({ opcode: actionOpcode }).then((next) => { if (generation.current === current) setActions((old) => [...old, next]); })
                  .catch((error) => onError(error.message)).finally(() => { if (generation.current === current) setLoading(false); });
              }}>＋</button></div></div>}
        </section>
        {isRule && <div className="rule-summary"><span>{t('rule.summary')}</span><p><b>{t('when')}</b> {conditionText(condition, t, locale)}</p>
          <p><b>{t('then')}</b> {actions.map((action) => t(`command.${action.opcode}`)).join(' → ')}</p></div>}
        <div className="builder-submit"><button className="gold full" type="submit" disabled={!actions.length}>{loading || busy ? t('pending') : t(existing ? 'builder.apply' : isRule ? 'builder.addRule' : isSetting ? 'builder.addSetting' : 'builder.addCommand')} <span aria-hidden="true">→</span></button>
          <button className="quiet full" type="button" onClick={() => submit(true)} disabled={!actions.length}>{t('builder.preview')}</button><small>{t('builder.fileNote')}</small></div>
      </fieldset>
    </form>
  </aside>;
}
