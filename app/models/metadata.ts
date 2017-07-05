import { Model, Prop, Record } from "app/core";

export interface MetadataAttributes {
    name: string;
    value: string;
}

@Model()
export class Metadata extends Record<MetadataAttributes> {
    @Prop() public name: string;
    @Prop() public value: string;
}
