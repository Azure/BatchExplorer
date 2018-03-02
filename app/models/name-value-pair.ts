import { Model, Prop, Record } from "@bl-common/core";

export interface NameValuePairAttributes {
    name: string;
    value?: string;
}

/**
 * Common name value pair object
 */
@Model()
export class NameValuePair extends Record<NameValuePairAttributes> {
    @Prop() public name: string;
    @Prop() public value: string;
}
