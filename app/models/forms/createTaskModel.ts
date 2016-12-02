
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
