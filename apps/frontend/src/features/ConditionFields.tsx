import type { RuleCondition } from '../shared/generated';
import type { Translate } from '../shared/presentation';
import { sorted } from '../shared/presentation';

type Props = { value: RuleCondition; change: (next: RuleCondition) => void; locale: string; t: Translate };

export const initialCondition = (): RuleCondition => ({ kind: 'units', player: 1, unit: 107,
  comparison: 0, amount: 0, resource: 0, flag: 0, flag_value: true });

export function ConditionFields({ value, change, locale, t }: Props) {
  const update = (patch: Partial<RuleCondition>) => change({ ...value, ...patch });
  const options = (key: string, count: number) => sorted(Array.from({ length: count }, (_, i) => i), (i) => t(`${key}.${i}`), locale)
    .map((i) => <option key={i} value={i}>{t(`${key}.${i}`)}</option>);
  return <section className="condition-section">
    <div className="section-heading"><span className="type-label condition-label">{t('when')}</span><h3>{t('rule.condition')}</h3></div>
    <div className="field"><label htmlFor="condition-kind">{t('condition.kind')}</label>
      <select id="condition-kind" value={value.kind} onChange={(event) => update({ kind: event.target.value, player: Math.min(value.player, 7) })}>
        <option value="units">{t('condition.units')}</option><option value="resources">{t('condition.resources')}</option>
        <option value="always">{t('condition.always')}</option><option value="flag">{t('condition.flagAdvanced')}</option>
      </select>
    </div>
    {['units', 'resources'].includes(value.kind) && <>
      <div className="field"><label htmlFor="condition-player">{t('player')}</label><select id="condition-player" value={value.player} onChange={(e) => update({ player: Number(e.target.value) })}>
        {options('player', value.kind === 'resources' ? 8 : 16)}</select></div>
      {value.kind === 'units' ? <div className="field"><label htmlFor="condition-unit">{t('unit')}</label><select id="condition-unit" value={value.unit} onChange={(e) => update({ unit: Number(e.target.value) })}>{options('unit', 111)}</select></div>
        : <div className="field"><label htmlFor="condition-resource">{t('resource')}</label><select id="condition-resource" value={value.resource} onChange={(e) => update({ resource: Number(e.target.value) })}>{options('resourceKind', 3)}</select></div>}
      <div className="field-grid"><div className="field"><label htmlFor="condition-comparison">{t('comparison')}</label><select id="condition-comparison" value={value.comparison} onChange={(e) => update({ comparison: Number(e.target.value) })}>{options('comparison', 6)}</select></div>
        <div className="field"><label htmlFor="condition-amount">{t('condition.amount')}</label><input id="condition-amount" type="number" required min={0} max={value.kind === 'units' ? 255 : 4294967295} value={Number.isFinite(value.amount) ? value.amount : ''} onChange={(e) => update({ amount: e.target.valueAsNumber })} /></div></div>
    </>}
    {value.kind === 'flag' && <div className="advanced-notice"><p>{t('flag.help')}</p><div className="field"><label htmlFor="condition-flag">{t('flag')}</label><input id="condition-flag" type="number" required min={0} max={255} value={value.flag} onChange={(e) => update({ flag: e.target.valueAsNumber })} /></div>
      <div className="field"><label htmlFor="condition-flag-value">{t('flag.expected')}</label><select id="condition-flag-value" value={Number(value.flag_value)} onChange={(e) => update({ flag_value: Boolean(Number(e.target.value)) })}><option value={1}>{t('flag.on')}</option><option value={0}>{t('flag.off')}</option></select></div>
      <details className="switch-guide"><summary>{t('flag.exampleTitle')}</summary><p>① {t('flag.exampleSet')}</p><p>② {t('flag.exampleCheck')}</p><small>{t('flag.sameNumber')}</small></details></div>}
    {value.kind === 'always' && <p className="field-hint">{t('condition.alwaysHint')}</p>}
    {value.kind !== 'flag' && value.kind !== 'always' && <p className="automatic-note">{t('rule.automatic')}</p>}
  </section>;
}
