import { useEffect, useState } from 'react';
import type { CommandEditRequest, Instruction } from '../shared/generated';

type Props = {
  instruction?: Instruction;
  index: number;
  revision: number;
  disabled: boolean;
  t: (key: string) => string;
  preview: (edit: CommandEditRequest) => void;
  onDraftChange: (dirty: boolean) => void;
};

export function Inspector({ instruction, index, revision, disabled, t, preview, onDraftChange }: Props) {
  const [values, setValues] = useState<number[]>([]);
  const [text, setText] = useState('');
  useEffect(() => {
    setValues(instruction?.fields.map((field) => field.value) ?? []);
    setText(instruction?.text ?? '');
  }, [instruction]);
  const draft = Boolean(instruction) && (JSON.stringify(values) !== JSON.stringify(instruction?.fields.map((field) => field.value)) || text !== (instruction?.text ?? ''));
  useEffect(() => { onDraftChange(draft); }, [draft, onDraftChange]);
  if (!instruction) return <aside className="inspector"><h2>{t('inspector')}</h2><p className="muted">{t('select')}</p></aside>;
  const edit = (action: string) => preview({ action, index, expected_revision: revision, values, text: instruction.text == null ? null : text });
  return <aside className="inspector">
    <div className="pane-heading"><span className="eyebrow">{t('instruction')} {index + 1}</span><h2>{t('inspector')}</h2></div>
    <div className="command-heading"><span className="sigil">{instruction.opcode}</span><h3>{t(`command.${instruction.opcode}`)}</h3></div>
    <form onSubmit={(event) => { event.preventDefault(); edit('replace'); }}>
      <fieldset disabled={disabled}>
        {instruction.fields.map((field, number) => <label className="field" key={number}>
          <span>{t(field.label_key)}{field.label_key === 'argument' ? ` ${number + 1}` : ''}</span>
          {field.options.length > 0 ? <select value={values[number] ?? field.value} onChange={(event) => setValues(values.map((value, i) => i === number ? Number(event.target.value) : value))}>
            {field.options.map((option) => <option key={option.value} value={option.value}>{t(option.label_key)}</option>)}
          </select> : field.max === 1 && field.label_key === 'enabled' ?
            <select value={values[number] ?? field.value} onChange={(event) => setValues(values.map((value, i) => i === number ? Number(event.target.value) : value))}>
              <option value={1}>{t('true')}</option><option value={0}>{t('false')}</option>
            </select> :
            <input type="number" required min={field.min} max={field.max} step="1" value={values[number] ?? field.value}
              onChange={(event) => setValues(values.map((value, i) => i === number ? event.target.valueAsNumber : value))} />}
          <small>{field.min.toLocaleString()} – {field.max.toLocaleString()}</small>
          {field.label_key === 'operation' && <small>{t('operation.hint')}</small>}
        </label>)}
        {instruction.text != null && <label className="field"><span>{t('text')}</span>
          <textarea rows={5} value={text} onChange={(event) => setText(event.target.value)} /><small>{t('text.encoding')}</small></label>}
        <button className="gold full" type="submit">{t('preview')} <span aria-hidden="true">→</span></button>
      </fieldset>
    </form>
    <div className="command-actions">
      <button disabled={disabled} onClick={() => edit('duplicate')}>{t('duplicate')}</button>
      <button disabled={disabled} className="danger" onClick={() => edit('delete')}>{t('delete')}</button>
      <button disabled={disabled || index === 0} onClick={() => edit('up')}>{t('up')}</button>
      <button disabled={disabled} onClick={() => edit('down')}>{t('down')}</button>
    </div>
  </aside>;
}
