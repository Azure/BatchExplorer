import { List } from "immutable";

import { ListProp, Model, Prop, Record } from "app/core";
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

export type ResizeErrorCode = "AccountCoreQuotaReached" | "ResizeStopped"
    | "AllocationFailed" | "AccountLowPriorityCoreQuotaReached";
export const ResizeErrorCode = {
    accountCoreQuotaReached: "AccountCoreQuotaReached" as ResizeErrorCode,
    accountLowPriorityCoreQuotaReached: "AccountLowPriorityCoreQuotaReached" as ResizeErrorCode,
    resizeStopped: "ResizeStopped" as ResizeErrorCode,
    allocationFailed: "AllocationFailed" as ResizeErrorCode,
};
