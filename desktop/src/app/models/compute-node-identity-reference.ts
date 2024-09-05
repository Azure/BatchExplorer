import { Model, Record, Prop } from "@batch-flask/core/record";

export interface ComputeNodeIdentityReferenceAttributes {
    resourceId: string;
}

/**
 * The reference to a user assigned identity associated with the Batch pool which a compute node will use.
 */
@Model()
export class ComputeNodeIdentityReference extends Record<ComputeNodeIdentityReferenceAttributes> {
    @Prop() public resourceId: string;
}
