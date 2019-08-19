import { Model, Prop, Record } from "@batch-flask/core";
import { ImageReference, ImageReferenceAttributes } from "./image-reference";

export interface ImageInformationAttributes {
    verificationType: string;
    nodeAgentSKUId: string;
    osType: string;
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
    @Prop(ImageReference) public imageReference: ImageReference;
}
