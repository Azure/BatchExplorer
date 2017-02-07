import { List, Record } from "immutable";

const SchedulingErrorRecord = Record({
    code: null,
    category: null,
    message: null,
    details: List([]),
});

/**
 * Job or task scheduling error.
 * Possible values are https://msdn.microsoft.com/en-us/library/azure/dn878162.aspx#BKMK_JobTaskError
 */
export class SchedulingError extends SchedulingErrorRecord {
    public code: string;
    public category: string;
    public message: string;
    public details: List<any>;
}
