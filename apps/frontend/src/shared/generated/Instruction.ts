// Generated from Rust OpenAPI. Run python tools/generate_types.py.
import type { NumericField } from './NumericField';
export type Instruction = {
  "bytes": Array<number>;
  "fields": Array<NumericField>;
  "offset": number;
  "opcode": number;
  "text"?: string | null;
};
