import { Model, Prop, Record } from "@batch-flask/core";

export interface NodeAgentSkuAttributes {
    id: string;
    verifiedImageReferences: any[];
    osType: string;
}

/**
 * Class for displaying Batch Node Agent SKU information.
 */
@Model()
export class NodeAgentSku extends Record<NodeAgentSkuAttributes> {
    @Prop() public id: string;
    @Prop() public verifiedImageReferences: any[];
    @Prop() public osType: string;
}
