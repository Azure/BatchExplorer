import { Model, Prop, Record } from "@batch-flask/core";

export interface MarketImageReferenceAttributes {
    publisher: string;
    offer: string;
    sku: string;
    version: string;
}

export interface CustomImageAttributes {
    virtualMachineImageId: string;
}

export type ImageReferenceAttributes =
MarketImageReferenceAttributes | CustomImageAttributes;

/**
 * Class for displaying Batch ImageReference information.
 */
@Model()
export class ImageReference extends Record<ImageReferenceAttributes> {
    @Prop() public publisher: string;
    @Prop() public offer: string;
    @Prop() public sku: string;
    @Prop() public version: string;
    @Prop() public virtualMachineImageId: string;
}
