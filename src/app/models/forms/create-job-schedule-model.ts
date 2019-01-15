import { JobScheduleCreateDto, MetaDataDto } from "app/models/dtos";
import { Duration } from "luxon";

export interface ScheduleModel {
    doNotRunAfter: string;
    doNotRunUntil: string;
    recurrenceInterval: Duration;
    startWindow: Duration;
}

export interface CreateJobScheduleModel {
    id: string;
    displayName: string;
    metadata: MetaDataDto[];
    schedule: ScheduleModel;
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
        metadata: formData.metadata,
    };
    return new JobScheduleCreateDto(data);
}

export function jobScheduleToFormModel(jobSchedule: JobScheduleCreateDto): CreateJobScheduleModel {
    return {
        id: jobSchedule.id,
        displayName: jobSchedule.displayName,
        metadata: jobSchedule.metadata,
        schedule: {
            doNotRunAfter: jobSchedule.schedule && jobSchedule.schedule.doNotRunAfter,
            doNotRunUntil: jobSchedule.schedule && jobSchedule.schedule.doNotRunUntil,
            recurrenceInterval: jobSchedule.schedule && jobSchedule.schedule.recurrenceInterval,
            startWindow: jobSchedule.schedule && jobSchedule.schedule.startWindow,
        },
        jobSpecification: jobSchedule.jobSpecification,
    };
}
