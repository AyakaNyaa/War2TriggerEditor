// Generated from Rust OpenAPI. Run python tools/generate_types.py.
import type { Fault } from './Fault';
import type { Program } from './Program';
import type { SectionView } from './SectionView';
export type DocumentView = {
  "capacity": number;
  "diagnostics": Array<Fault>;
  "dirty": boolean;
  "id": string;
  "kind": string;
  "name": string;
  "original_size": number;
  "program": Program;
  "revision": number;
  "sections": Array<SectionView>;
  "writable": boolean;
};
