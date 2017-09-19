import * as moment from "moment";

import { NodeFillType } from "app/models";
import { PoolCreateDto, UserAccountDto } from "app/models/dtos";

export enum PoolOsSources {
    PaaS,
    IaaS,
}

export interface PoolOSPickerModel {
    source: PoolOsSources;
    cloudServiceConfiguration: {
        osFamily: string,
    };
    virtualMachineConfiguration: {
        nodeAgentSKUId: string,
        imageReference: {
            publisher: string,
            offer: string,
            sku: string,
        },
    };
}

export interface PoolScaleModel {
    enableAutoScale: boolean;
    autoScaleFormula: string;
    autoScaleEvaluationInterval: number;
    targetDedicatedNodes: number;
    targetLowPriorityNodes: number;
}

export interface PackageReferenceModel {
    applicationId: string;
    version: string;
}

export interface CreatePoolModel {
    id: string;
    displayName: string;
    scale: PoolScaleModel;
    vmSize: string;
    maxTasksPerNode: string;
    enableInterNodeCommunication: boolean;
    os: PoolOSPickerModel;
    startTask: any;
    userAccounts: UserAccountDto[];
    taskSchedulingPolicy: NodeFillType;
    appLicenses: string[];
    appPackages: PackageReferenceModel[];
}

export function createPoolToData(output: CreatePoolModel): PoolCreateDto {
    const outputScale: PoolScaleModel = output.scale || {} as any;
    let data: any = {
        id: output.id,
        displayName: output.displayName,
        vmSize: output.vmSize,
        enableAutoScale: outputScale.enableAutoScale,
        maxTasksPerNode: Number(output.maxTasksPerNode),
        enableInterNodeCommunication: output.enableInterNodeCommunication,
        taskSchedulingPolicy:  {
            nodeFillType: output.taskSchedulingPolicy,
        },
        startTask: output.startTask,
        userAccounts: output.userAccounts,
    };

    if (outputScale.enableAutoScale) {
        data.autoScaleFormula = outputScale.autoScaleFormula;
        data.autoScaleEvaluationInterval = moment.duration({ minutes: outputScale.autoScaleEvaluationInterval });
    } else {
        data.targetDedicatedNodes = outputScale.targetDedicatedNodes;
        data.targetLowPriorityNodes = outputScale.targetLowPriorityNodes;
    }

    if (output.os.source === PoolOsSources.PaaS) {
        data.cloudServiceConfiguration = output.os.cloudServiceConfiguration;
    } else {
        data.virtualMachineConfiguration = output.os.virtualMachineConfiguration;
        // if (output.os.virtualMachineConfiguration.osType !== "windows") {
        //     delete data.virtualMachineConfiguration.windowsConfiguration;
        // }
    }

    if (output.appLicenses && output.appLicenses.length > 0) {
        data.applicationLicenses = output.appLicenses;
    }

    if (output.appPackages && output.appPackages.length > 0) {
        data.applicationPackageReferences = output.appPackages;
    }

    return data;
}

/**
 * Take an existing pool and create the data for a new form with that pool data.
 * Used to clone a pool
 */
export function poolToFormModel(pool: PoolCreateDto): CreatePoolModel {
    const autoScaleInterval = pool.autoScaleEvaluationInterval;
    return {
        id: pool.id,
        displayName: pool.displayName,
        vmSize: pool.vmSize,
        scale: {
            targetDedicatedNodes: pool.targetDedicatedNodes,
            targetLowPriorityNodes: pool.targetLowPriorityNodes,
            enableAutoScale: pool.enableAutoScale,
            autoScaleFormula: pool.autoScaleFormula,
            autoScaleEvaluationInterval: autoScaleInterval && autoScaleInterval.asMinutes(),
        },
        maxTasksPerNode: pool.maxTasksPerNode.toString(),
        enableInterNodeCommunication: pool.enableInterNodeCommunication,
        taskSchedulingPolicy: pool.taskSchedulingPolicy.nodeFillType,
        os: {
            source: pool.cloudServiceConfiguration ? PoolOsSources.PaaS : PoolOsSources.IaaS,
            cloudServiceConfiguration: pool.cloudServiceConfiguration,
            virtualMachineConfiguration: pool.virtualMachineConfiguration,
        },
        startTask: pool.startTask,
        userAccounts: pool.userAccounts,
        appLicenses: pool.applicationLicenses,
        appPackages: pool.applicationPackageReferences,
    };
}
