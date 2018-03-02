import { Model, Prop, Record } from "@batch-flask/core";
import { JobHookTaskExecutionInfo } from "./job-hook-task-execution-info";

export interface JobHookTaskAttributes {
    poolId: string;
    nodeId: string;
    nodeUrl: string;
    jobPreparationTaskExecutionInfo: JobHookTaskExecutionInfo;
    jobReleaseTaskExecutionInfo: JobHookTaskExecutionInfo;
}

@Model()
export class JobHookTask extends Record<JobHookTaskAttributes> {
    @Prop() public poolId: string;
    @Prop() public nodeId: string;
    @Prop() public nodeUrl: string;
    @Prop() public preparationTask: JobHookTaskExecutionInfo;
    @Prop() public releaseTask: JobHookTaskExecutionInfo;

    /**
     * Id is a computed attribute using the pool and the node id. It is not returned by the server
     */
    @Prop() public id: string;
    constructor(data: JobHookTaskAttributes) {
        super({
            ...data,
            id: `${data.poolId}/${data.nodeId}`,
            preparationTask: data.jobPreparationTaskExecutionInfo,
            releaseTask: data.jobReleaseTaskExecutionInfo,
        } as any);
    }
}
