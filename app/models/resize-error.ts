import { List, Record } from "immutable";

//  tslint:disable:variable-name
const ResizeErrorRecord = Record({
    code: null,
    message: null,
    vals: [],
});

export class ResizeError extends ResizeErrorRecord {
    public code: ResizeErrorCode;
    public message: string;

    // equivalent to the values in the API as values is already used in immutable
    public vals: List<any>;

    constructor(data: any = {}) {
        super(Object.assign({}, data, {
            vals: List(data.values),
        }));
    }
}

export type ResizeErrorCode = "AccountCoreQuotaReached" | "ResizeStopped";
export const ResizeErrorCode = {
    accountCoreQuotaReached: "AccountCoreQuotaReached" as ResizeErrorCode,
    resizeStopped: "ResizeStopped" as ResizeErrorCode,
};
