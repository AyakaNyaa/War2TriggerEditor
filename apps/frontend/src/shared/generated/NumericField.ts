// Generated from Rust OpenAPI. Run python tools/generate_types.py.
import type { FieldOption } from './FieldOption';
export type NumericField = {
  "label_key": string;
  "max": number;
  "min": number;
  "options": Array<FieldOption>;
  "value": number;
};
