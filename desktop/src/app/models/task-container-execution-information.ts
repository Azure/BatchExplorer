import { Model, Record, Prop } from "@batch-flask/core/record";

export interface TaskContainerExecutionInfoAttributes {
    containerId: string;
    error?: string;
    state?: string;
}

/**
 * Task container execution information.
 * https://docs.microsoft.com/en-us/rest/api/batchservice/Task/Get#definitions_taskcontainerexecutioninformation
 */
@Model()
export class TaskContainerExecutionInfo extends Record<TaskContainerExecutionInfoAttributes> {
    @Prop() public containerId: string;
    @Prop() public error: string;
    @Prop() public state: string;
}
