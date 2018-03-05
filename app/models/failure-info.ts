import { List } from "immutable";

import { ListProp, Model, Prop, Record } from "@batch-flask/core";
import { NameValuePair, NameValuePairAttributes } from "./name-value-pair";

export interface FailureInfoAttributes {
    code: string;
    category?: string;
    message?: string;
    details?: NameValuePairAttributes[];
}

/**
 * Job or task scheduling error.
 * Possible values are https://msdn.microsoft.com/en-us/library/azure/dn878162.aspx#BKMK_JobTaskError
 */
@Model()
export class FailureInfo extends Record<FailureInfoAttributes> {
    @Prop() public code: string;
    @Prop() public category: string;
    @Prop() public message: string;
    @ListProp(NameValuePair) public details: List<NameValuePair> = List([]);
}
