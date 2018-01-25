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
        schedule: {
            doNotRunAfter: formData.schedule && formData.schedule.doNotRunAfter,
            doNotRunUntil: formData.schedule && formData.schedule.doNotRunUntil,
            recurrenceInterval: formData.schedule && formData.schedule.recurrenceInterval,
            startWindow: formData.schedule && formData.schedule.startWindow,
        },
        jobSpecification: formData.jobSpecification,
    };
    return new JobScheduleCreateDto(data);
}

export function jobScheduleToFormModel(jobSchedule: JobScheduleCreateDto): CreateJobScheduleModel {
    return {
        id: jobSchedule.id,
        displayName: jobSchedule.displayName,
        metadata: jobSchedule.metadata,
        schedule: {
            doNotRunAfter: jobSchedule.schedule.doNotRunAfter,
            doNotRunUntil: jobSchedule.schedule.doNotRunUntil,
            recurrenceInterval: jobSchedule.schedule.recurrenceInterval,
            startWindow: jobSchedule.schedule.startWindow,
        },
        jobSpecification: jobSchedule.jobSpecification,
    };
}
