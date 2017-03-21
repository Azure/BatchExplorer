import { Record } from "immutable";

import { TaskState } from "app/models/task";

const NodeRecentTaskRecord = Record({
    taskUrl: null,
    jobId: null,
    taskId: null,
    subtaskId: null,
    taskState: null,
    executionInfo: null,
});

export interface NodeRecentTaskAttributes {
    taskUrl: string;
    jobId: string;
    taskId: string;
    subtaskId: number;
    taskState: TaskState;
    executionInfo: any;
};

export class NodeRecentTask extends NodeRecentTaskRecord implements NodeRecentTaskAttributes {
    public taskUrl: string;
    public jobId: string;
    public taskId: string;
    public subtaskId: number;
    public taskState: TaskState;
    public executionInfo: any;

    constructor(data: Partial<NodeRecentTaskAttributes>) {
        super(data);
    }
}
