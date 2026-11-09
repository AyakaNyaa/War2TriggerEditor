// Generated from Rust OpenAPI. Run python tools/generate_types.py.
import type { Program } from './Program';
export type ChangePreview = {
  "base_revision": number;
  "changed_bytes": number;
  "commands": Array<Array<number>>;
  "output_size": number;
  "program": Program;
};
