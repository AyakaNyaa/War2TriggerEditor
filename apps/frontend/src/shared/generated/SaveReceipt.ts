// Generated from Rust OpenAPI. Run python tools/generate_types.py.
import type { Fault } from './Fault';
export type SaveReceipt = {
  "backup": string;
  "hash": string;
  "path": string;
  "warnings": Array<Fault>;
};
