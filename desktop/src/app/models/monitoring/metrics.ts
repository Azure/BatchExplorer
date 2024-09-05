import { Model, Record, Prop } from "@batch-flask/core/record";
import { Duration } from "luxon";

export interface MetricValue {
    timeStamp: string;
    total: number;
    average: number;
}

export interface Metric {
    name: string;
    label: string;
    data: MetricValue[];
    color: string;
}

export interface MonitoringMetricListAttributes {
    interval: string;
    timespan: string;
    metrics: Metric[];
}

@Model()
export class MonitoringMetricList extends Record<MonitoringMetricListAttributes> {
    @Prop() public interval: Duration;

    @Prop(Object) public metrics: Metric[];
}
