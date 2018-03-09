import { Model, Prop, Record } from "@batch-flask/core";
import * as moment from "moment";

export interface LocalizableString {
    value: string;
    localizedValue: string;
}

export interface MetricValue {
    timeStamp: string;
    total: number;
}

export interface Metric {
    name: LocalizableString;
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
