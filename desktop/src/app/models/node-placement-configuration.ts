import { Model, Record, Prop } from "@batch-flask/core/record";

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
