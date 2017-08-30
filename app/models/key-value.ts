import { Model, Prop, Record } from "app/core";

export interface KeyValueAttributes {
    name: string;
    value?: string;
}

@Model()
export class KeyValue extends Record<KeyValueAttributes> {
    @Prop() public name: string;
    @Prop() public value: string;
}
