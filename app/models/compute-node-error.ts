import { List } from "immutable";

import { ListProp, Model, Prop, Record } from "@bl-common/core";
import { NameValuePair, NameValuePairAttributes } from "./name-value-pair";

export interface ComputeNodeErrorAttributes {
    code: string;
    message?: string;
    errorDetails?: NameValuePairAttributes[];
}
@Model()
export class ComputeNodeError extends Record<ComputeNodeErrorAttributes> {
    @Prop() public code: string;
    @Prop() public message: string;
    @ListProp(NameValuePair) public errorDetails: List<NameValuePair> = List([]);
}
