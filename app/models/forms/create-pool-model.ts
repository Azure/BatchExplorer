import { PoolCreateDto, UserAccountDto } from "app/models/dtos";
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

export interface PoolScaleModel {
    enableAutoScale: boolean;
    autoScaleFormula: string;
    autoScaleEvaluationInterval: number;
    targetDedicated: number;
}

export interface UserAccountFormModel {
    username: string;
    password: string;
    runElevated: boolean;
    sshPrivateKey: string;
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
    userAccounts: UserAccountFormModel[];
}

export function createPoolToData(output: CreatePoolModel): PoolCreateDto {
    console.log("out", output);
    const outputScale: PoolScaleModel = output.scale || {} as any;
    let data: any = {
        id: output.id,
        displayName: output.displayName,
        vmSize: output.vmSize,
        enableAutoScale: outputScale.enableAutoScale,
        maxTasksPerNode: Number(output.maxTasksPerNode),
        enableInterNodeCommunication: output.enableInterNodeCommunication,
        startTask: output.startTask,
        userAccounts: output.userAccounts.map(x => userAccountToDto(x)),
    };

    if (outputScale.enableAutoScale) {
        data.autoScaleFormula = outputScale.autoScaleFormula;
        data.autoScaleEvaluationInterval = moment.duration({ minutes: outputScale.autoScaleEvaluationInterval });
    } else {
        data.targetDedicated = outputScale.targetDedicated;
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
    const autoScaleInterval = pool.autoScaleEvaluationInterval;
    return {
        id: pool.id,
        displayName: pool.displayName,
        vmSize: pool.vmSize,
        scale: {
            targetDedicated: pool.targetDedicated,
            enableAutoScale: pool.enableAutoScale,
            autoScaleFormula: pool.autoScaleFormula,
            autoScaleEvaluationInterval: autoScaleInterval && autoScaleInterval.asMinutes(),
        },
        maxTasksPerNode: pool.maxTasksPerNode.toString(),
        enableInterNodeCommunication: pool.enableInterNodeCommunication,
        os: {
            source: pool.cloudServiceConfiguration ? PoolOsSources.PaaS : PoolOsSources.IaaS,
            cloudServiceConfiguration: pool.cloudServiceConfiguration,
            virtualMachineConfiguration: pool.virtualMachineConfiguration,
        },
        startTask: pool.startTask,
        userAccounts: pool.userAccounts.map(x => userAccountToFormModel(x)),
    };
};

function userAccountToFormModel(userAccount: UserAccountDto) {
    return {
        username: userAccount.username,
        password: userAccount.password,
        runElevated: userAccount.elevationLevel === "admin",
        sshPrivateKey: userAccount.sshPrivateKey,
    };
}

function userAccountToDto(userAccount: UserAccountFormModel): UserAccountDto {
    return {
        username: userAccount.username,
        password: userAccount.password,
        elevationLevel: userAccount.runElevated ? "admin" : "nonAdmin",
        sshPrivateKey: userAccount.sshPrivateKey,
    };
}

