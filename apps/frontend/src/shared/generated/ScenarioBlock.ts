// Generated from Rust OpenAPI. Run python tools/generate_types.py.
import type { RuleCondition } from './RuleCondition';
export type ScenarioBlock = {
  "action_indices": Array<number>;
  "condition"?: (null | RuleCondition);
  "depth": number;
  "editable_rule": boolean;
  "end": number;
  "kind": string;
  "start": number;
};
