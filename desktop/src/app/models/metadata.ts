import { Model, Record, Prop } from "@batch-flask/core/record";

export interface MetadataAttributes {
    name: string;
    value: string;
}

@Model()
export class Metadata extends Record<MetadataAttributes> {
    @Prop() public name: string;
    @Prop() public value: string;
}
