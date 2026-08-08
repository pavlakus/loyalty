import { type MembershipAggregate, type MembershipLifecycleEvent } from "./membership-aggregate.js";

export type MembershipLifecycleCommand = "suspend" | "reactivate" | "close";

export function applyMembershipLifecycleCommand(aggregate: MembershipAggregate, command: MembershipLifecycleCommand, occurredAt: string): MembershipLifecycleEvent {
  if (command === "suspend") return aggregate.suspend(occurredAt);
  if (command === "reactivate") return aggregate.reactivate(occurredAt);
  return aggregate.close(occurredAt);
}
