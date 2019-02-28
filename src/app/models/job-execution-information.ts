import { ListProp, Model, Prop, Record } from "@batch-flask/core";
import { List } from "immutable";
import { FailureInfoAttributes } from "./failure-info";
import { NameValuePair, NameValuePairAttributes } from "./name-value-pair";

export interface JobSchedulingErrorAttributes {
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
export class JobSchedulingError extends Record<JobSchedulingErrorAttributes> {
    @Prop() public code: string;
    @Prop() public category: string;
    @Prop() public message: string;
    @ListProp(NameValuePair) public details: List<NameValuePair> = List([]);
}

export interface JobExecutionInformationAttributes {
    startTime: Date;
    endTime: Date;
    poolId: string;
    schedulingError: FailureInfoAttributes;
    terminateReason: JobTerminateReason;
}

/**
 * Contains information about the execution of a job in the Azure
 */
@Model()
export class JobExecutionInformation extends Record<JobExecutionInformationAttributes> {
    @Prop() public startTime: Date;
    @Prop() public endTime: Date;
    @Prop() public poolId: string;
    @Prop() public schedulingError: JobSchedulingError;
    @Prop() public terminateReason: JobTerminateReason;
}
