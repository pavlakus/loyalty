import assert from "node:assert/strict";
import test from "node:test";
import { InitialStatusAssignmentError, assignInitialStatus } from "../dist/modules/membership/initial-status-assignment.js";

const configuration = { levels: [
  { id: "gold", name: "Gold", rank: 2, minimumXp: 100n, minimumVisits: 5, benefitDefinitionIds: [] },
  { id: "bronze", name: "Bronze", rank: 1, minimumXp: 0n, minimumVisits: 0, benefitDefinitionIds: [] },
] };

test("assigns the lowest-ranked configured Status Level deterministically", () => {
  assert.deepEqual(assignInitialStatus({ membershipId: "membership-1", programConfigurationVersionId: "program-1:1", statusLevelConfiguration: configuration }), { membershipId: "membership-1", programConfigurationVersionId: "program-1:1", statusLevelId: "bronze" });
});

test("rejects invalid identity and invalid Status Level configuration", () => {
  assert.throws(() => assignInitialStatus({ membershipId: "", programConfigurationVersionId: "program-1:1", statusLevelConfiguration: configuration }), InitialStatusAssignmentError);
  assert.throws(() => assignInitialStatus({ membershipId: "membership-1", programConfigurationVersionId: "program-1:1", statusLevelConfiguration: { levels: [] } }), InitialStatusAssignmentError);
});
