import { JobCreateDto, MetaDataDto } from "app/models/dtos";
import { Duration } from "luxon";

export interface JobConstraintsModel {
    maxWallClockTime: Duration;
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
    metadata: MetaDataDto[];
    usesTaskDependencies: boolean;
}

export function createJobFormToJsonData(formData: CreateJobModel): JobCreateDto {
    const data: any = {
        id: formData.id,
        displayName: formData.displayName,
        priority: formData.priority,
        constraints: {
            maxWallClockTime: formData.constraints && formData.constraints.maxWallClockTime,
            maxTaskRetryCount: formData.constraints && formData.constraints.maxTaskRetryCount,
        },
        poolInfo: {
            poolId: formData.poolInfo && formData.poolInfo.poolId,
        },
        jobManagerTask: formData.jobManagerTask,
        jobPreparationTask: formData.jobPreparationTask,
        jobReleaseTask: formData.jobReleaseTask,
        onAllTasksComplete: formData.onAllTasksComplete,
        onTaskFailure: formData.onTaskFailure,
        metadata: formData.metadata,
    };
    return new JobCreateDto(data);
}

export function jobToFormModel(job: JobCreateDto): CreateJobModel {
    return {
        id: job.id,
        displayName: job.displayName,
        priority: job.priority,
        jobManagerTask: job.jobManagerTask,
        jobPreparationTask: job.jobPreparationTask,
        jobReleaseTask: job.jobReleaseTask,
        commonEnvironmentSettings: job.commonEnvironmentSettings,
        poolInfo: job.poolInfo,
        onAllTasksComplete: job.onAllTasksComplete,
        onTaskFailure: job.onTaskFailure,
        metadata: job.metadata,
        usesTaskDependencies: job.usesTaskDependencies,
        constraints: {
            maxWallClockTime: job.constraints.maxWallClockTime,
            maxTaskRetryCount: job.constraints.maxTaskRetryCount,
        },
    };
}
