import { Model, Prop, Record } from "@batch-flask/core";

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

export enum LeaseStatus {
    locked = "locked",
    unlocked = "unlocked",
    unspecified = "unspecified",
}

export enum LeaseState {
    available = "available",
    breaking = "breaking",
    broken = "broken",
    expired = "expired",
    leased = "leased",
    unspecified = "unspecified",
}
