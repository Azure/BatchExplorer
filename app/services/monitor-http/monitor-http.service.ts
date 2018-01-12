import { Injectable } from "@angular/core";
import {
    CoreCountMetrics, FailedTaskMetrics, MonitorMetrics, NodeStatesMetrics, TaskStatesMetrics,
} from "app/services";
import { Observable } from "rxjs/Observable";
import { AccountService } from "../account.service";
import { ArmHttpService } from "../arm-http.service";

export interface LocalizableString {
    value: string;
    localizedValue: string;
}

export interface MetricValue {
    timeStamp: string;
    total: string;
}

export interface Metric {
    name: LocalizableString;
    data: MetricValue[];
}

/**
 * Wrapper around the http service so call the azure ARM monitor api.
 */
@Injectable()
export class MonitorHttpService {
    public coreCounts: Observable<any>;
    public taskStates: Observable<any>;
    public failedTask: Observable<any>;
    public nodeStates: Observable<any>;

    private _coreCountMetrics: MonitorMetrics;
    private _taskStateMetrics: MonitorMetrics;
    private _failedTaskMetrics: MonitorMetrics;
    private _nodeStateMetrics: MonitorMetrics;

    constructor(private accountService: AccountService, private armService: ArmHttpService) {
        this._coreCountMetrics = new CoreCountMetrics();
        this._taskStateMetrics = new TaskStatesMetrics();
        this._failedTaskMetrics = new FailedTaskMetrics();
        this._nodeStateMetrics = new NodeStatesMetrics();
        this._setCoreCounts();
        this._setTaskState();
        this._setFailedTask();
        this._setNodeState();
    }

    private _setCoreCounts() {
        this.coreCounts = this._getCurrentAccount().flatMap(resourceId => {
            return this._getMetrics(this._coreCountMetrics, resourceId);
        }).take(1);
    }

    private _setTaskState() {
        this.taskStates = this._getCurrentAccount().flatMap(resourceId => {
            return this._getMetrics(this._taskStateMetrics, resourceId);
        }).take(1);
    }

    private _setFailedTask() {
        this.failedTask = this._getCurrentAccount().flatMap(resourceId => {
            return this._getMetrics(this._failedTaskMetrics, resourceId);
        }).take(1);
    }

    private _setNodeState() {
        this.nodeStates = this._getCurrentAccount().flatMap(resourceId => {
            return this._getMetrics(this._nodeStateMetrics, resourceId);
        }).take(1);
    }

    private _getCurrentAccount() {
        return this.accountService.currentAccount.flatMap(account => {
            return Observable.of(account && account.id);
        }).share();
    }

    private _getMetrics(metric: MonitorMetrics, resourceId: string) {
        if (resourceId) {
            const url = metric.getRequestUrl(resourceId);
            const options = metric.getRequestOptions();
            return this.armService.get(url, options).flatMap(value => {
                const metrics: Metric[] = value.json().value.map((metric): Metric => {
                    return {
                        name: metric.name,
                        data: metric.timeseries[0].data.map((data): MetricValue => {
                            return {
                                timeStamp: data.timeStamp,
                                total: data.total,
                            } as MetricValue;
                        }),
                    } as Metric;
                });
                return Observable.of(metrics);
            });
        }
    }
}
