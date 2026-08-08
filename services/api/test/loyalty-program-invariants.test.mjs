import assert from "node:assert/strict";
import test from "node:test";
import { ProgramInvariantValidationError, validateProgramConfigurationInvariants } from "../dist/modules/loyalty-program/program-invariants.js";

test("validates Program ownership and configuration-version linkage", () => {
  const input = { programId: "program-1", programConfigurationVersionId: "program-1:5", configuration: { programId: "program-1", sections: [{ section: "REWARD_RULES", value: {} }] } };
  assert.equal(validateProgramConfigurationInvariants(input).programConfigurationVersionId, "program-1:5");
});

test("rejects cross-Program versions and invalid sections", () => {
  const base = { programId: "program-1", programConfigurationVersionId: "program-1:5", configuration: { programId: "program-1", sections: [] } };
  assert.throws(() => validateProgramConfigurationInvariants({ ...base, programConfigurationVersionId: "program-2:1" }), ProgramInvariantValidationError);
  assert.throws(() => validateProgramConfigurationInvariants({ ...base, configuration: { ...base.configuration, programId: "program-2" } }), ProgramInvariantValidationError);
  assert.throws(() => validateProgramConfigurationInvariants({ ...base, configuration: { ...base.configuration, sections: [{ section: "UNKNOWN", value: {} }] } }), ProgramInvariantValidationError);
});
