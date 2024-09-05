import { Model, Record, Prop } from "@batch-flask/core/record";

export interface HttpHeaderAttributes {
    name: string;
    value: string;
}

@Model()
export class HttpHeader extends Record<HttpHeaderAttributes> {
    @Prop() public name: string;
    @Prop() public value: string;
}
