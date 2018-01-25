import { JobScheduleCreateDto } from "app/models/dtos";

export interface CreateJobScheduleModel {
    id: string;
    displayName: string;
    metadata: any;
    schedule: any;
    jobSpecification: any;
}

export function createJobScheduleFormToJsonData(formData: CreateJobScheduleModel): JobScheduleCreateDto {
    const data: any = {
        id: formData.id,
        displayName: formData.displayName,
        schedule: formData.schedule,
        jobSpecification: formData.jobSpecification,
    };
    return new JobScheduleCreateDto(data);
}

export function jobScheduleToFormModel(job: JobScheduleCreateDto): CreateJobScheduleModel {
    return {
        id: job.id,
        displayName: job.displayName,
        metadata: job.metadata,
        schedule: job.schedule,
        jobSpecification: job.jobSpecification,
    };
}
