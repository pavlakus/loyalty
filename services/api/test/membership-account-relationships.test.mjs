import assert from "node:assert/strict";
import test from "node:test";
import { MembershipAccountRelationshipError, createMembershipAccountRelationships } from "../dist/modules/membership/membership-account-relationships.js";

test("creates separate Reward and XP account relationships for one Membership", () => {
  assert.deepEqual(createMembershipAccountRelationships({ membershipId: "membership-1", rewardAccountId: "reward-1", xpAccountId: "xp-1" }), { membershipId: "membership-1", rewardAccountId: "reward-1", xpAccountId: "xp-1" });
});

test("rejects missing identifiers and mixed Reward/XP account identity", () => {
  assert.throws(() => createMembershipAccountRelationships({ membershipId: "membership-1", rewardAccountId: "same", xpAccountId: "same" }), MembershipAccountRelationshipError);
  assert.throws(() => createMembershipAccountRelationships({ membershipId: "", rewardAccountId: "reward-1", xpAccountId: "xp-1" }), MembershipAccountRelationshipError);
});
