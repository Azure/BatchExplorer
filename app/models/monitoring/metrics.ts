import { Model, Prop, Record } from "@batch-flask/core";
import * as moment from "moment";

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
    @Prop(moment.duration) public interval: moment.Duration;

    @Prop(Object) public metrics: Metric[];
}
