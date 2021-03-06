import { Model, Prop, Record } from "@batch-flask/core";
import { ImageReference, MarketImageReferenceAttributes } from "./image-reference";

export enum RenderApplication {
    Maya = "maya",
    _3dsMax = "3dsmax",
}

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
    imageReferenceId: string;
    app: string;
    appVersion: string;
    renderer: string;
    rendererVersion: string;
}

@Model()
export class RenderingContainerImage extends Record<RenderingContainerImageAttributes>  {
    @Prop() public containerImage: string;
    @Prop() public imageReferenceId: string;
    @Prop() public os: string;
    @Prop() public app: string;
    @Prop() public appVersion: string;
    @Prop() public renderer: string;
    @Prop() public rendererVersion: string;
}
