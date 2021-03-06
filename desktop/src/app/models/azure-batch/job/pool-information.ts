import { Model, Prop, Record } from "@batch-flask/core";
import { Pool, PoolAttributes } from "../pool";

@Model()
export class PoolSpecification extends Pool {

}

export enum PoolLifetimeOption {
    Job = "job",
    JobSchedule = "jobschedule",
}

export interface AutoPoolSpecificationAttributes {
    autoPoolIdPrefix: string;
    keepAlive: boolean;
    poolLifetimeOption: PoolLifetimeOption;
    pool: PoolAttributes;
}

@Model()
export class AutoPoolSpecification extends Record<AutoPoolSpecificationAttributes> {
    @Prop() public autoPoolIdPrefix: string;
    @Prop() public keepAlive: boolean;
    @Prop() public poolLifetimeOption: PoolLifetimeOption;
    @Prop() public pool: PoolSpecification;
}

export interface PoolInformationAttributes {
    poolId: string;
    autoPoolSpecification: AutoPoolSpecificationAttributes;
}

@Model()
export class PoolInformation extends Record<PoolInformationAttributes> {
    @Prop() public poolId: string;
    @Prop() public autoPoolSpecification: AutoPoolSpecification;
}
