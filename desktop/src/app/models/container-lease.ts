import { LeaseStateType, LeaseStatusType } from "@azure/storage-blob";
import { Model, Record, Prop } from "@batch-flask/core/record";

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

export type LeaseStatus = LeaseStatusType;

export type LeaseState = LeaseStateType;
