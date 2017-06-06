import { List } from "immutable";

import { ListProp, Model, Prop, Record } from "app/core";
import { NameValuePair, NameValuePairAttributes } from "./name-value-pair";

export interface SchedulingErrorAttributes {
    code: string;
    category: string;
    message: string;
    details: NameValuePairAttributes[];
}

/**
 * Job or task scheduling error.
 * Possible values are https://msdn.microsoft.com/en-us/library/azure/dn878162.aspx#BKMK_JobTaskError
 */
@Model()
export class SchedulingError extends Record<SchedulingErrorAttributes> {
    @Prop() public code: string;
    @Prop() public category: string;
    @Prop() public message: string;
    @ListProp(NameValuePair) public details: List<NameValuePairAttributes>;
}
