import { TaskContainerSettingsDto, TaskCreateDto } from "app/models/dtos";
import { Duration } from "luxon";
import { PackageReferenceModel } from "./create-pool-model";

export interface TaskConstraintsModel {
    maxWallClockTime: Duration;
    maxTaskRetryCount: number;
    retentionTime: Duration;
}

export interface CreateTaskModel {
    id: string;
    displayName: string;
    commandLine: string;
    exitConditions: any;
    resourceFiles: any[];
    environmentSettings: any[];
    affinityInfo: any;
    constraints: TaskConstraintsModel;
    requiredSlots: number;
    userIdentity: any;
    multiInstanceSettings: any;
    appPackages: PackageReferenceModel[];
    containerSettings: TaskContainerSettingsDto;
}

export function createTaskFormToJsonData(formData: CreateTaskModel): TaskCreateDto {
    const data: any = {
        id: formData.id,
        displayName: formData.displayName,
        commandLine: formData.commandLine,
        exitConditions: null,
        resourceFiles: formData.resourceFiles,
        environmentSettings: formData.environmentSettings,
        affinityInfo: null,
        constraints: {
            maxWallClockTime: formData.constraints && formData.constraints.maxWallClockTime,
            maxTaskRetryCount: formData.constraints && formData.constraints.maxTaskRetryCount,
            retentionTime: formData.constraints && formData.constraints.retentionTime,
        },
        requiredSlots: formData.requiredSlots,
        userIdentity: formData.userIdentity,
        multiInstanceSettings: formData.multiInstanceSettings,
        applicationPackageReferences: formData.appPackages,
        containerSettings: formData.containerSettings,
    };

    if (formData.appPackages && formData.appPackages.length > 0) {
        data.applicationPackageReferences = formData.appPackages;
    }

    return new TaskCreateDto(data);
}

export function taskToFormModel(task: TaskCreateDto): CreateTaskModel {
    const out: any = {
        id: task.id,
        displayName: task.displayName,
        commandLine: task.commandLine,
        exitConditions: task.exitConditions,
        resourceFiles: task.resourceFiles || [],
        environmentSettings: task.environmentSettings || [],
        affinityInfo: task.affinityInfo,
        requiredSlots: task.requiredSlots,
        userIdentity: task.userIdentity,
        multiInstanceSettings: task.multiInstanceSettings,
        appPackages: task.applicationPackageReferences,
        containerSettings: task.containerSettings,
    };

    if (task.constraints) {
        out.constraints = {
            maxWallClockTime: task.constraints.maxWallClockTime,
            maxTaskRetryCount: task.constraints.maxTaskRetryCount,
            retentionTime: task.constraints.retentionTime,
        };
    }

    return out;
}
