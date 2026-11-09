import type { CSSProperties } from 'react';
const paths = {
  folder: 'M2 6h7l2 2h11v12H2z M2 6V4h7l2 2',
  plus: 'M12 5v14 M5 12h14',
  save: 'M4 3h13l4 4v14H3V3z M7 3v6h10V3 M7 21v-8h10v8',
  undo: 'M8 4 3 9l5 5 M3 9h11a7 7 0 0 1 0 14',
  redo: 'm16 4 5 5-5 5 M21 9H10a7 7 0 0 0 0 14',
  search: 'M15 15 21 21 M17 10a7 7 0 1 1-14 0 7 7 0 0 1 14 0',
  catalog: 'M4 3h6v7H4z M14 3h6v7h-6z M4 14h6v7H4z M14 14h6v7h-6z',
  chevron: 'm8 5 7 7-7 7',
};
export function Icon({ name, style }: { name: keyof typeof paths; style?: CSSProperties }) {
  return <svg className="icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={style}><path d={paths[name]} /></svg>;
}
