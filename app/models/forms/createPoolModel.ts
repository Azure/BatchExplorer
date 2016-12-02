import { Pool } from "app/models";

export enum PoolOsSources {
    PaaS,
    IaaS,
}

export interface PoolOSPickerModel {
    source: PoolOsSources;
    cloudServiceConfiguration: {
        osFamily: number,
    };
    virtualMachineConfiguration: {
        nodeAgentSKUId: string,
        imageReference: {
            publisher: string,
            offer: string,
            sku: string,
        }
    };
}

export interface CreatePoolModel {
    id: string;
    displayName: string;
    targetDedicated: string;
    vmSize: string;
    maxTasksPerNode: string;
    enableInterNodeCommunication: boolean;
    os: PoolOSPickerModel;
}

export function createPoolToData(output: CreatePoolModel): any {
    let data: any = {
        id: output.id,
        displayName: output.displayName,
        vmSize: output.vmSize,
        targetDedicated: output.targetDedicated,
        maxTasksPerNode: output.maxTasksPerNode,
        enableInterNodeCommunication: output.enableInterNodeCommunication,
    };

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
export function poolToFormModel(pool: Pool): CreatePoolModel {
    return {
        id: pool.id,
        displayName: pool.displayName,
        vmSize: pool.vmSize,
        targetDedicated: pool.targetDedicated.toString(),
        maxTasksPerNode: pool.maxTasksPerNode.toString(),
        enableInterNodeCommunication: pool.enableInterNodeCommunication,
        os: {
            source: pool.cloudServiceConfiguration ? PoolOsSources.PaaS : PoolOsSources.IaaS,
            cloudServiceConfiguration: pool.cloudServiceConfiguration,
            virtualMachineConfiguration: pool.virtualMachineConfiguration,
        },
    };
};
