import assert from "node:assert/strict";
import test from "node:test";
import { createConfigurationDraft, LoyaltyProgramConfigurationValidationError } from "../dist/modules/loyalty-program/program-configuration.js";

test("accepts only the approved Program configuration sections", () => {
  const input = { programId: "program-1", sections: [{ section: "REWARD_RULES", value: { definition: "owned-by-follow-up-task" } }] };
  const result = createConfigurationDraft(input);
  assert.deepEqual(result, input);
  assert.notEqual(result.sections[0].value, input.sections[0].value);
});

test("rejects unknown, duplicate, and non-object configuration sections", () => {
  assert.throws(() => createConfigurationDraft({ programId: "program-1", sections: [{ section: "UNKNOWN", value: {} }] }), LoyaltyProgramConfigurationValidationError);
  assert.throws(() => createConfigurationDraft({ programId: "program-1", sections: [{ section: "XP_RULES", value: {} }, { section: "XP_RULES", value: {} }] }), /only once/);
  assert.throws(() => createConfigurationDraft({ programId: "program-1", sections: [{ section: "STATUS_LEVELS", value: [] }] }), LoyaltyProgramConfigurationValidationError);
});
