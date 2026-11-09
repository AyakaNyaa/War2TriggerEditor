// Generated from Rust OpenAPI. Run python tools/generate_types.py.
export type CommandEditRequest = {
  "action": string;
  "expected_revision": number;
  "index": number;
  "opcode"?: number | null;
  "text"?: string | null;
  "values": Array<number>;
};
