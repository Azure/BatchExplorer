import { MetaDataDto } from "./metadata.dto";

export interface PoolCreateDto {
    id: string;
    displayName?: string;
    vmSize?: string;
    cloudServiceConfiguration?: {
        osFamily: string;
        targetOSVersion?: string;
    };
    virtualMachineConfiguration?: {
        nodeAgentSKUId: string;
        imageReference: {
            publisher: string;
            offer: string;
            sku: string;
            version?: string;
        }
        windowsConfiguration?: {
            enableAutomaticUpdates?: boolean;
        }
    };
    networkConfiguration?: {
        subnetId: string;
    };
    resizeTimeout?: moment.Duration;
    targetDedicated?: number;
    maxTasksPerNode?: number;
    taskSchedulingPolicy?: {
        nodeFillType?: string;
    };
    autoScaleFormula?: string;
    autoScaleEvaluationInterval?: moment.Duration;
    enableAutoScale?: boolean;
    enableInterNodeCommunication?: boolean;
    startTask?: any;
    certificateReferences?: any[];
    applicationPackageReferences: any[];
    metadata: MetaDataDto[];
}
