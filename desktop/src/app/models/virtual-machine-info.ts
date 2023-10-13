import { Model, Prop, Record } from "@batch-flask/core";
import { ImageReference } from "./image-reference";

export interface VirtualMachineInfoAttributes {
    imageReference: ImageReference;
}

@Model()
export class VirtualMachineInfo extends Record<VirtualMachineInfoAttributes> {
    @Prop() imageReference: ImageReference;
}
