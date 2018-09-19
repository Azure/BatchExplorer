export enum TelemetryType {
    Event = 0,
    Exception = 1,
    Trace = 2,
    Metric = 3,
    Request = 4,
    Dependency = 5,
}

export interface Telemetry {
    time?: Date;

    properties?: {
        [key: string]: any,
    };
}

export interface ExceptionTelemetry extends Telemetry {
    exception: Error;
}

export interface EventTelemetry extends Telemetry {
    name: string;
    measurements?: {
        [key: string]: number,
    };
}

export interface MetricTelemetry extends Telemetry {
    /**
     * A string that identifies the metric.
     */
    name: string;
    /**
     * The value of the metric
     */
    value: number;
    /**
     * The number of samples used to get this value
     */
    count?: number;
    /**
     * The min sample for this set
     */
    min?: number;
    /**
     * The max sample for this set
     */
    max?: number;
    /**
     * The standard deviation of the set
     */
    stdDev?: number;
}
