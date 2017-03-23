import { TaskCreateDto } from "app/models/dtos";

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
    environmentSettings: any;
    affinityInfo: any;
    constraints: TaskConstraintsModel;
    runElevated: boolean;
    multiInstanceSettings: any;
    applicationPackageReferences: any[];
}

export function createTaskFormToJsonData(formData: CreateTaskModel): any {
    let retentionTime = null;
    let maxWallClockTime = null;
    let data: any = {
        id: formData.id,
        displayName: formData.displayName,
        commandLine: formData.commandLine,
        exitConditions: null,
        resourceFiles: formData.resourceFiles,
        environmentSettings: null,
        affinityInfo: null,
        constraints: {
            maxWallClockTime: maxWallClockTime,
            maxTaskRetryCount: formData.constraints.maxTaskRetryCount,
            retentionTime: retentionTime,
        },
        runElevated: formData.runElevated,
        multiInstanceSettings: null,
        applicationPackageReferences: null,
    };

    return data;
}

export function taskToFormModel(task: TaskCreateDto): CreateTaskModel {
    const out: any = {
        id: task.id,
        displayName: task.displayName,
        commandLine: task.commandLine,
        exitConditions: task.exitConditions,
        resourceFiles: task.resourceFiles,
        environmentSettings: task.environmentSettings,
        affinityInfo: task.affinityInfo,

        runElevated: task.runElevated,
        multiInstanceSettings: task.multiInstanceSettings,
        applicationPackageReferences: task.applicationPackageReferences,
    };

    if (task.constraints) {
        out.constraints = {
            maxWallClockTime: durationToString(task.constraints.maxWallClockTime),
            maxTaskRetryCount: task.constraints.maxTaskRetryCount,
            retentionTime: durationToString(task.constraints.retentionTime),
        };
    }
    return out;
}

function durationToString(duration: moment.Duration) {
    if (duration) {
        return (duration as any).toISOString();
    } else {
        return null;
    }
}
