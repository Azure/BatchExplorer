import { ListProp, Model, Prop, Record } from "@batch-flask/core";
import { List } from "immutable";
import { ImageReference, ImageReferenceAttributes } from "./image-reference";

export interface NodeAgentSkuAttributes {
    id: string;
    verifiedImageReferences: ImageReferenceAttributes[];
    osType: string;
}

/**
 * Class for displaying Batch Node Agent SKU information.
 */
@Model()
export class NodeAgentSku extends Record<NodeAgentSkuAttributes> {
    @Prop() public id: string;
    @ListProp(ImageReference) public verifiedImageReferences: List<ImageReference> = List([]);
    @Prop() public osType: string;
}
