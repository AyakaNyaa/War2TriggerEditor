// Generated from Rust OpenAPI. Run python tools/generate_types.py.
import type { Fault } from './Fault';
import type { Instruction } from './Instruction';
export type Program = {
  "diagnostics": Array<Fault>;
  "instructions": Array<Instruction>;
  "length"?: number | null;
  "terminator"?: number | null;
};
