// Generated from Rust OpenAPI. Run python tools/generate_types.py.
import type { CommandDraftRequest } from './CommandDraftRequest';
import type { RuleCondition } from './RuleCondition';
export type RuleRequest = {
  "actions": Array<CommandDraftRequest>;
  "condition": RuleCondition;
  "expected_revision": number;
  "index": number;
  "replace_end"?: number | null;
};
