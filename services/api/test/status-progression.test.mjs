import assert from "node:assert/strict";
import test from "node:test";
import { evaluateStatusProgression } from "../dist/modules/xp/status-progression.js";
const configuration = { levels: [{ id: "bronze", name: "Bronze", rank: 1, minimumXp: 0n, minimumVisits: 0, benefitDefinitionIds: [] }, { id: "silver", name: "Silver", rank: 2, minimumXp: 100n, minimumVisits: 2, benefitDefinitionIds: ["benefit-1"] }] };
const base = { membershipId: "membership-1", currentStatusLevelId: "bronze", xp: 100n, qualifyingVisits: 2, membershipYearId: "year-1", programConfigurationVersionId: "version-1", membershipYearCompleted: false, evaluatedAt: "2026-08-08T10:00:00.000Z" };
test("upgrades immediately and exposes configured Benefit references", () => { const transition = evaluateStatusProgression(configuration, base); assert.equal(transition?.toStatusLevelId, "silver"); assert.deepEqual(transition?.benefitDefinitionIds, ["benefit-1"]); });
test("does not downgrade during an active Membership Year", () => { assert.equal(evaluateStatusProgression(configuration, { ...base, currentStatusLevelId: "silver", xp: 0n, qualifyingVisits: 0 }), null); });
