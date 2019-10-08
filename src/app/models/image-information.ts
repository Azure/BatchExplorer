import { ListProp, Model, Prop, Record } from "@batch-flask/core";
import { List } from "immutable";
import { ImageReference, ImageReferenceAttributes } from "./image-reference";

export interface ImageInformationAttributes {
    verificationType: string;
    nodeAgentSKUId: string;
    osType: string;
    batchSupportEndOfLife: Date;
    capabilities: List<string>;
    imageReference: ImageReferenceAttributes;
}

/**
 * Class for displaying Batch Node Agent SKU information.
 */
@Model()
export class ImageInformation extends Record<ImageInformationAttributes> {
    @Prop() public verificationType: string;
    @Prop() public nodeAgentSKUId: string;
    @Prop() public osType: string;
    @Prop() public batchSupportEndOfLife: Date;
    @ListProp(String) public capabilities: List<string>;
    @Prop(ImageReference) public imageReference: ImageReference;
}
