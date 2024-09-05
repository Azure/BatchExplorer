import { Model, Record, Prop } from "@batch-flask/core/record";
import { ImageReference } from "./image-reference";

export interface VirtualMachineInfoAttributes {
    imageReference: ImageReference;
}

@Model()
export class VirtualMachineInfo extends Record<VirtualMachineInfoAttributes> {
    @Prop() imageReference: ImageReference;
}
