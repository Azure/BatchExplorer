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

/**
 * A pool output model in the 2024-07-01 API version format. Note that only
 * properties need for backwards compatibility are included.
 */
export interface LegacyPoolOutput {
    /** The ID of the resource. */
    id?: string;

    /** The name of the resource. */
    name?: string;

    /** The type of the resource. */
    type?: string;

    /** The properties associated with the pool. */
    properties?: LegacyPoolPropertiesOutput;
}

export interface LegacyPoolPropertiesOutput {
    targetNodeCommunicationMode?: NodeCommunicationMode;

    /** Determines how a pool communicates with the Batch service. */
    currentNodeCommunicationMode?: NodeCommunicationMode;
}

/**
 * A pool model in the 2024-07-01 API version format. Note that only
 * properties need for backwards compatibility are included.
 */
export interface LegacyPool {
    /** The ID of the resource. */
    id?: string;

    /** The name of the resource. */
    name?: string;

    /** The type of the resource. */
    type?: string;

    /** The properties associated with the pool. */
    properties?: LegacyPoolProperties;
}

export interface LegacyPoolProperties {
    /** If omitted, the default value is Default. */
    targetNodeCommunicationMode?: NodeCommunicationMode;

    /** Determines how a pool communicates with the Batch service. */
    currentNodeCommunicationMode?: NodeCommunicationMode;
}
