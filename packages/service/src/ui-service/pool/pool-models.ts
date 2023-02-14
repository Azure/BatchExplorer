export {
    Pool,
    PoolListByBatchAccountParameters,
    PoolCreateParameters,
    PoolUpdateParameters,
    PoolDeleteParameters,
    PoolGetParameters,
    PoolDisableAutoScaleParameters,
    PoolStopResizeParameters,
    PoolOutput,
} from "@batch/arm-batch-rest";

export type NodeCommunicationMode = "Default" | "Simplified" | "Classic";
