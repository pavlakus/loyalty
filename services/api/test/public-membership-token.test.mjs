import assert from "node:assert/strict";
import test from "node:test";
import { PublicMembershipTokenError, createMembershipQrPayload, createPublicMembershipToken } from "../dist/modules/membership/public-membership-token.js";

test("creates an opaque QR payload containing only the public Membership token", () => {
  const token = createPublicMembershipToken("opaque-public-token-1");
  assert.deepEqual(createMembershipQrPayload(token), { publicMemberToken: "opaque-public-token-1" });
});

test("rejects empty or non-opaque token values", () => {
  assert.throws(() => createPublicMembershipToken(""), PublicMembershipTokenError);
  assert.throws(() => createPublicMembershipToken("+381 60000000"), PublicMembershipTokenError);
  assert.throws(() => createMembershipQrPayload({ value: "" }), PublicMembershipTokenError);
});
