export type Locale = 'ru' | 'en';
const catalogs: Record<Locale, Record<string, string>> = { ru: {}, en: {} };
const modules = import.meta.glob<{ default: Record<string, string> }>('../locales/*/*.json', { eager: true });
for (const [path, module] of Object.entries(modules)) {
  const locale = path.split('/')[2] as Locale;
  if (locale in catalogs) Object.assign(catalogs[locale], module.default);
}
export const translator = (locale: Locale) => (key: string) =>
  catalogs[locale][key] ?? catalogs.en[key] ?? catalogs.ru[key] ?? key;
