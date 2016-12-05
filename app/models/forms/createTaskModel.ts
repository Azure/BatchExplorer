import { Task } from "app/models";

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
    dependsOn: any;
}

export function createTaskFormToJsonData(formData: CreateTaskModel): any {
    let retentionTime = null;
    let maxWallClockTime = null;
    let data: any = {
        id: formData.id,
        displayName: formData.displayName,
        commandLine: formData.commandLine,
        exitConditions: null,
        resourceFiles: null,
        environmentSettings: null,
        affinityInfo: null,
        constraints: {
            maxWallClockTime: maxWallClockTime,
            maxTaskRetryCount: formData.constraints.maxTaskRetryCount,
            retentionTime: retentionTime,
        },
        runElevated: this.runElevated,
        multiInstanceSettings: null,
        applicationPackageReferences: null,
        dependsOn: null,
    };

    return data;
}

export function taskToFormModel(task: Task): CreateTaskModel {
    return {
        id: task.id,
        displayName: task.displayName,
        commandLine: task.commandLine,
        exitConditions: task.exitConditions,
        resourceFiles: task.resourceFiles,
        environmentSettings: task.environmentSettings,
        affinityInfo: task.affinityInfo,
        constraints: {
            maxWallClockTime: task.constraints.maxWallClockTime.toISOString(),
            maxTaskRetryCount: task.constraints.maxTaskRetryCount,
            retentionTime: task.constraints.retentionTime.toISOString(),
        },
        runElevated: task.runElevated,
        multiInstanceSettings: task.multiInstanceSettings,
        applicationPackageReferences: task.applicationPackageReferences,
        dependsOn: task.dependsOn,
    }
}
