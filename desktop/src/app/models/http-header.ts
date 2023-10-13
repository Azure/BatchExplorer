import { Model, Prop, Record } from "@batch-flask/core";

export interface HttpHeaderAttributes {
    name: string;
    value: string;
}

@Model()
export class HttpHeader extends Record<HttpHeaderAttributes> {
    @Prop() public name: string;
    @Prop() public value: string;
}
