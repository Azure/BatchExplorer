import { Model, Prop, Record } from "app/core";
import { TaskState } from "./task";

export interface StartTaskInfoAttributes {
    state: TaskState;
    startTime: Date;
    endTime: Date;
    exitCode: number;
    retryCount: number;
}

/**
 * Class for displaying Start Task execution info from a node.
 */
@Model()
export class StartTaskInfo extends Record<StartTaskInfoAttributes> {
    @Prop() public state: TaskState;
    @Prop() public startTime: Date;
    @Prop() public endTime: Date;
    @Prop() public exitCode: number;
    @Prop() public retryCount: number;
}
