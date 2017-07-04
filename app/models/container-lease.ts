import { Model, Prop, Record } from "app/core";

export interface ContainerLeaseAttributes {
    status: LeaseStatus;
    state: LeaseState;
    duration: string;
}

/**
 * Class for displaying blob container lease information.
 */
@Model()
export class ContainerLease extends Record<ContainerLeaseAttributes> {
    @Prop() public status: LeaseStatus;
    @Prop() public state: LeaseState;
    @Prop() public duration: string;
}

export type LeaseStatus = "locked" | "unlocked" | "unspecified";
export const LeaseStatus = {
    locked: "locked" as LeaseStatus,
    unlocked: "unlocked" as LeaseStatus,
    unspecified: "unspecified" as LeaseStatus,
};

export type LeaseState = "available" | "breaking" | "broken" | "expired" | "leased" | "unspecified";
export const LeaseState = {
    locked: "available" as LeaseState,
    unlocked: "breaking" as LeaseState,
    broken: "broken" as LeaseState,
    expired: "expired" as LeaseState,
    leased: "leased" as LeaseState,
    unspecified: "unspecified" as LeaseState,
};
