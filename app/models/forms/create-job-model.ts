
import { JobCreateDto } from "app/models/dtos";
import * as moment from "moment";

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

export function createJobFormToJsonData(formData: CreateJobModel): JobCreateDto {
    let data: any = {
        id: formData.id,
        displayName: formData.displayName,
        priority: formData.priority,
        constraints: {
            maxWallClockTime: formData.constraints.maxWallClockTime,
            maxTaskRetryCount: formData.constraints.maxTaskRetryCount,
        },
        poolInfo: {
            poolId: formData.poolInfo && formData.poolInfo.poolId,
        },
        jobManagerTask: formData.jobManagerTask,
        jobPreparationTask: formData.jobPreparationTask,
        jobReleaseTask: formData.jobReleaseTask,
        onAllTasksComplete: formData.onAllTasksComplete,
        onTaskFailure: formData.onTaskFailure,
    };
    return new JobCreateDto(data);
}

export function jobToFormModel(job: JobCreateDto): CreateJobModel {
    const out: any = {
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
    };

    if (job.constraints) {
        let maxWallClockTime = null;
        // if value is patched from json editor, maxwallclock needs to be converted to duration
        if (typeof job.constraints.maxWallClockTime === "string") {
            maxWallClockTime = moment.duration(job.constraints.maxWallClockTime);
        } else {
            maxWallClockTime = job.constraints.maxWallClockTime;
        }

        out.constraints = {
            maxWallClockTime: maxWallClockTime && maxWallClockTime.toISOString(),
            maxTaskRetryCount: job.constraints.maxTaskRetryCount,
        };
    }
    return out;
}
