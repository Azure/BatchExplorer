import { Model, Prop, Record } from "@batch-flask/core";
import { ImageReference, MarketImageReferenceAttributes } from "./image-reference";

export enum RenderEngine {
    MayaSW = "mayasw",
    Arnold = "arnold",
    VRay = "vray",
}

export interface RenderingImageReferenceAttributes {
    id: string;
    nodeSkuId: string;
    marketImageReference: MarketImageReferenceAttributes;
}

@Model()
export class RenderingImageReference extends Record<RenderingImageReferenceAttributes>   {
    @Prop() public id: string;
    @Prop() public nodeSkuId: string;
    @Prop() public marketImageReference: ImageReference;
}

export interface RenderingContainerImageAttributes {
    containerImage: string;
    os: string;
    mayaVersion: string;
    imageReferenceId: string;
    arnoldVersion?: string;
    vrayVersion?: string;
}

@Model()
export class RenderingContainerImage extends Record<RenderingContainerImageAttributes>  {
    @Prop() public containerImage: string;
    @Prop() public imageReferenceId: string;
    @Prop() public os: string;
    @Prop() public mayaVersion: string;
    @Prop() public arnoldVersion?: string;
    @Prop() public vrayVersion?: string;
}
