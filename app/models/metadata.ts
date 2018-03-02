import { Model, Prop, Record } from "@bl-common/core";

export interface MetadataAttributes {
    name: string;
    value: string;
}

@Model()
export class Metadata extends Record<MetadataAttributes> {
    @Prop() public name: string;
    @Prop() public value: string;
}
