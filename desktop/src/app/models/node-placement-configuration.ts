import { Model, Prop, Record } from "@batch-flask/core";

export interface NodePlacementConfigurationAttributes {
    policy: NodePlacementPolicyType;
}

/**
 * Class for displaying Batch WindowsConfiguration information.
 */
@Model()
export class NodePlacementConfiguration extends Record<NodePlacementConfigurationAttributes> {
    @Prop() public policy: NodePlacementPolicyType;
}

export enum NodePlacementPolicyType {
    regional = "regional",
    zonal = "zonal",
}
