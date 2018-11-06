import { List } from "immutable";

import { ListProp, Model, Prop, Record } from "@batch-flask/core";
import { NameValuePair, NameValuePairAttributes } from "./name-value-pair";

export interface ResizeErrorAttributes {
    code: ResizeErrorCode;
    message: string;
    values: NameValuePairAttributes[];
}

@Model()
export class ResizeError extends Record<ResizeErrorAttributes> {
    @Prop() public code: ResizeErrorCode;
    @Prop() public message: string;
    @ListProp(Object) public values: List<NameValuePair> = List([]);
}

export enum ResizeErrorCode {
    accountCoreQuotaReached = "AccountCoreQuotaReached",
    accountLowPriorityCoreQuotaReached = "AccountLowPriorityCoreQuotaReached",
    resizeStopped = "ResizeStopped",
    allocationFailed = "AllocationFailed",
}
