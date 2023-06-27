import { Model, Prop, Record } from "@batch-flask/core";

export interface AffinityInformationAttributes {
    affinityId: string;
}
/**
 * A locality hint that can be used by the Batch service to select a
 * compute node on which to start a task.
 */
@Model()
export class AffinityInformation extends Record<AffinityInformationAttributes> {
    @Prop() public affinityId: string;
}
