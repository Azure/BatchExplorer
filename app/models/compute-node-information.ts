/**
 * Information about the compute node on which a task ran.
 */
import { Model, Prop, Record } from "@batch-flask/core";

export interface ComputeNodeInformationAttributes {
    affinityId: string;
    nodeUrl: string;
    poolId: string;
    nodeId: string;
    taskRootDirectory: string;
    taskRootDirectoryUrl: string;
}

@Model()
export class ComputeNodeInformation extends Record<ComputeNodeInformationAttributes> {
    @Prop() public affinityId: string;
    @Prop() public nodeUrl: string;
    @Prop() public poolId: string;
    @Prop() public nodeId: string;
    @Prop() public taskRootDirectory: string;
    @Prop() public taskRootDirectoryUrl: string;
}
