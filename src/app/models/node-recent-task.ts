import { Model, Prop, Record } from "@batch-flask/core";

import { TaskState } from "app/models/azure-batch/task";

export interface NodeRecentTaskAttributes {
    taskUrl: string;
    jobId: string;
    taskId: string;
    subtaskId: number;
    taskState: TaskState;
    executionInfo: any;
}

@Model()
export class NodeRecentTask extends Record<NodeRecentTaskAttributes> {
    @Prop() public taskUrl: string;
    @Prop() public jobId: string;
    @Prop() public taskId: string;
    @Prop() public subtaskId: number;
    @Prop() public taskState: TaskState;
    @Prop() public executionInfo: any;
}
