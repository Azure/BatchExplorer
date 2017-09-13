
import { JobCreateDto } from "app/models/dtos";

export interface JobConstraintsModel {
    maxWallClockTime: string;
    maxTaskRetryCount: number;
}

export interface PoolInfoModel {
    poolId?: string;
}

export interface CreateJobModel {
    id: string;
    displayName: string;
    priority: number;
    constraints: JobConstraintsModel;
    jobManagerTask: any;
    jobPreparationTask: any;
    jobReleaseTask: any;
    commonEnvironmentSettings: any;
    poolInfo?: PoolInfoModel;
    onAllTasksComplete: string;
    onTaskFailure: string;
    metadata: any;
    usesTaskDependencies: boolean;
}

export function createJobFormToJsonData(formData: CreateJobModel): any {
    let maxWallClockTime = null;
    let data: any = {
        id: formData.id + "?", // TEST ONLY TODO REMOVE.
        displayName: formData.displayName,
        priority: formData.priority,
        constraints: {
            maxWallClockTime: maxWallClockTime,
            maxTaskRetryCount: formData.constraints.maxTaskRetryCount,
        },
        poolInfo: {
            poolId: formData.poolInfo.poolId,
        },
    };

    return data;
}

export function jobToFormModel(job: JobCreateDto): CreateJobModel {
    return {
        id: job.id,
        displayName: job.displayName,
        priority: job.priority,
        constraints: {
            maxWallClockTime: job.constraints.maxWallClockTime.toISOString(),
            maxTaskRetryCount: job.constraints.maxTaskRetryCount,
        },
        jobManagerTask: job.jobManagerTask,
        jobPreparationTask: job.jobPreparationTask,
        jobReleaseTask: job.jobReleaseTask,
        commonEnvironmentSettings: job.commonEnvironmentSettings,
        poolInfo: job.poolInfo,
        onAllTasksComplete: job.onAllTasksComplete,
        onTaskFailure: job.onTaskFailure,
        metadata: job.metadata,
        usesTaskDependencies: job.usesTaskDependencies,
    };
}
