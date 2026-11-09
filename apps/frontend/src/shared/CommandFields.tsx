import type { Instruction } from './generated';
import { sorted, type Translate } from './presentation';

type Props = { instruction: Instruction; values: number[]; text: string; disabled?: boolean;
  t: Translate; locale: string; onChange: (values: number[], text: string) => void; prefix: string };

export function CommandFields({ instruction, values, text, disabled, t, locale, onChange, prefix }: Props) {
  const change = (index: number, value: number) => onChange(values.map((item, i) => i === index ? value : item), text);
  return <fieldset disabled={disabled} className="command-fields">
    {instruction.fields.map((field, index) => {
      const id = `${prefix}-field-${index}`;
      const value = values[index] ?? field.value;
      return <div className="field" key={id}>
        <label htmlFor={id}>{t(instruction.opcode === 21 && field.label_key === 'enabled' ? 'flag.state' : field.label_key)}{field.label_key === 'argument' ? ` ${index + 1}` : ''}</label>
        {field.label_key === 'playerMask' ? <div className="player-choices" id={id}>
          {sorted(Array.from({ length: 8 }, (_, player) => player), (player) => t(`player.${player}`), locale).map((player) => <label key={player} htmlFor={`${id}-${player}`}><input type="checkbox" id={`${id}-${player}`} checked={Boolean(value & (1 << player))} onChange={(event) => change(index, event.target.checked ? value | (1 << player) : value & ~(1 << player))} />{t(`player.${player}`)}</label>)}
        </div> : field.options.length ? <select id={id} value={value} onChange={(event) => change(index, Number(event.target.value))}>
          {!field.options.some((o) => o.value === value) && <option value={value}>{value}</option>}
          {sorted(field.options, (o) => t(o.label_key), locale).map((option) => <option key={option.value} value={option.value}>{t(option.label_key)}</option>)}
        </select> : field.max === 1 ? <select id={id} value={value} onChange={(event) => change(index, Number(event.target.value))}>
          <option value={1}>{t('true')}</option><option value={0}>{t('false')}</option>
        </select> : <input id={id} type="number" required min={field.min} max={field.max} step={1} value={Number.isFinite(value) ? value : ''}
          onChange={(event) => change(index, event.target.valueAsNumber)} />}
        {field.label_key === 'operation' && <small>{t('operation.hint')}</small>}
        {field.label_key === 'flag' && <small>{t('flag.help')}</small>}
        {field.max > 1 && !field.options.length && field.label_key !== 'playerMask' && <small>{t('field.range')} {field.min.toLocaleString()} – {field.max.toLocaleString()}</small>}
      </div>;
    })}
    {instruction.text != null && <div className="field text-field">
      <label htmlFor={`${prefix}-text`}>{t(instruction.opcode === 120 ? 'goal.text' : 'text')}</label>
      <textarea id={`${prefix}-text`} rows={5} value={text} onChange={(event) => onChange(values, event.target.value)} placeholder={t('text.placeholder')} />
      <small>{t('text.encoding')}</small>
    </div>}
    {!instruction.fields.length && instruction.text == null && <p className="field-hint">{t('field.noParameters')}</p>}
  </fieldset>;
}
