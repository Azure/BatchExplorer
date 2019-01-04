import { Model, Prop, Record } from "@batch-flask/core";
import { Duration } from "luxon";

export interface MetricValue {
    timeStamp: string;
    total: number;
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
