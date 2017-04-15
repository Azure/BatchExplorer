import { PoolCreateDto } from "app/models/dtos";
import * as moment from "moment";

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

export interface CreatePoolModel {
    id: string;
    displayName: string;
    targetDedicated: number;
    enableAutoScale: boolean;
    autoScaleFormula: string;
    autoScaleEvaluationInterval: number;
    vmSize: string;
    maxTasksPerNode: string;
    enableInterNodeCommunication: boolean;
    os: PoolOSPickerModel;
    startTask: any;
}

export function createPoolToData(output: CreatePoolModel): PoolCreateDto {
    let data: any = {
        id: output.id,
        displayName: output.displayName,
        vmSize: output.vmSize,
        enableAutoScale: output.enableAutoScale,
        maxTasksPerNode: Number(output.maxTasksPerNode),
        enableInterNodeCommunication: output.enableInterNodeCommunication,
        startTask: output.startTask,
    };

    if (output.enableAutoScale) {
        data.autoScaleFormula = output.autoScaleFormula;
        data.autoScaleEvaluationInterval = moment.duration({ minutes: output.autoScaleEvaluationInterval });
    } else {
        data.targetDedicated = output.targetDedicated;
    }

    if (output.os.source === PoolOsSources.PaaS) {
        data.cloudServiceConfiguration = output.os.cloudServiceConfiguration;
    } else {
        data.virtualMachineConfiguration = output.os.virtualMachineConfiguration;
        // if (output.os.virtualMachineConfiguration.osType !== "windows") {
        //     delete data.virtualMachineConfiguration.windowsConfiguration;
        // }
    }

    return data;
}

/**
 * Take an existing pool and create the data for a new form with that pool data.
 * Used to clone a pool
 */
export function poolToFormModel(pool: PoolCreateDto): CreatePoolModel {
    return {
        id: pool.id,
        displayName: pool.displayName,
        vmSize: pool.vmSize,
        targetDedicated: pool.targetDedicated,
        enableAutoScale: pool.enableAutoScale,
        autoScaleFormula: pool.autoScaleFormula,
        autoScaleEvaluationInterval: pool.autoScaleEvaluationInterval.asMinutes(),
        maxTasksPerNode: pool.maxTasksPerNode.toString(),
        enableInterNodeCommunication: pool.enableInterNodeCommunication,
        os: {
            source: pool.cloudServiceConfiguration ? PoolOsSources.PaaS : PoolOsSources.IaaS,
            cloudServiceConfiguration: pool.cloudServiceConfiguration,
            virtualMachineConfiguration: pool.virtualMachineConfiguration,
        },
        startTask: pool.startTask,
    };
};
