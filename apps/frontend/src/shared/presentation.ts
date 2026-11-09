import type { CommandSpec, Instruction, RuleCondition, ScenarioBlock, Program } from './generated';
export type Translate = (key: string) => string;
export const normalize = (value: string) => value.normalize('NFKD').replace(/\p{Diacritic}/gu, '').toLocaleLowerCase().trim();
export function matches(query: string, ...content: string[]) {
  const haystack = normalize(content.join(' '));
  return normalize(query).split(/\s+/).every((word) => haystack.includes(word));
}
export function describe(instruction: Instruction, t: Translate) {
  return [instruction.text, ...instruction.fields.map((field) => {
    const option = field.options.find((o) => o.value === field.value);
    const value = option ? t(option.label_key) : field.label_key === 'enabled' ? t(field.value ? 'true' : 'false') : String(field.value);
    return `${t(field.label_key)}: ${value}`;
  })].filter(Boolean).join(' · ');
}
export function conditionText(condition: RuleCondition, t: Translate, locale = 'ru') {
  if (condition.kind === 'units') return `${t('condition.units')} · ${t(`player.${condition.player}`)} · ${t(`unit.${condition.unit}`)} ${t(`comparison.${condition.comparison}`)} ${condition.amount}`;
  if (condition.kind === 'resources') return `${t('condition.resources')} · ${t(`player.${condition.player}`)} · ${t(`resourceKind.${condition.resource}`)} ${t(`comparison.${condition.comparison}`)} ${condition.amount.toLocaleString(locale)}`;
  if (condition.kind === 'flag') return `${t('condition.flag')} ${condition.flag}: ${t(condition.flag_value ? 'true' : 'false')}`;
  return t('condition.always');
}
export function blockMatches(block: ScenarioBlock, program: Program, catalog: CommandSpec[], query: string, t: Translate) {
  const instructions = program.instructions.slice(block.start, block.end);
  return matches(query, block.condition ? conditionText(block.condition, t) : '', ...instructions.flatMap((instruction) => {
    const spec = catalog.find((s) => s.opcode === instruction.opcode);
    return [t(`command.${instruction.opcode}`), describe(instruction, t), t(`group.${spec?.group ?? 'advanced'}`)];
  }));
}
export function sorted<T>(items: T[], name: (item: T) => string, locale: string) {
  const compare = new Intl.Collator(locale, { numeric: true, sensitivity: 'base' });
  return [...items].sort((a, b) => compare.compare(name(a), name(b)));
}
export function commandDescription(spec: CommandSpec, t: Translate) {
  const key = `description.${spec.opcode}`;
  return t(key) === key ? t(`group.description.${spec.group}`) : t(key);
}
