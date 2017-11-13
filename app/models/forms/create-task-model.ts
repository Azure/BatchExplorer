import { TaskCreateDto } from "app/models/dtos";
import * as moment from "moment";
import { PackageReferenceModel } from "./create-pool-model";

export interface TaskConstraintsModel {
    maxWallClockTime: string;
    maxTaskRetryCount: number;
    retentionTime: string;
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
    userIdentity: any;
    multiInstanceSettings: any;
    appPackages: PackageReferenceModel[];
}

export function createTaskFormToJsonData(formData: CreateTaskModel): TaskCreateDto {
    let data: any = {
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
        userIdentity: formData.userIdentity,
        multiInstanceSettings: null,
        applicationPackageReferences: null,
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
        userIdentity: task.userIdentity,
        multiInstanceSettings: task.multiInstanceSettings,
        appPackages: task.applicationPackageReferences,
    };

    if (task.constraints) {
        out.constraints = {
            maxWallClockTime: toDuration(task.constraints.maxWallClockTime),
            maxTaskRetryCount: task.constraints.maxTaskRetryCount,
            retentionTime: toDuration(task.constraints.retentionTime),
        };
    }

    return out;
}

/**
 * When duration is patched from json editor, ensure value gets converted back to duration object from string
 * @param duration
 */
function toDuration(duration: any) {
    let result = null;
    if (typeof duration === "string") {
        result = moment.duration(duration);
    } else {
        result = duration;
    }
    return result;
}
