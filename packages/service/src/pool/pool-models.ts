export {
    ListPoolsResultOutput,
    Pool,
    PoolListByBatchAccountParameters,
    PoolCreateParameters,
    PoolUpdateParameters,
    PoolDeleteParameters,
    PoolGetParameters,
    PoolDisableAutoScaleParameters,
    PoolStopResizeParameters,
    PoolOutput,
} from "../internal/arm-batch-rest";

export type NodeCommunicationMode = "Default" | "Simplified" | "Classic";
