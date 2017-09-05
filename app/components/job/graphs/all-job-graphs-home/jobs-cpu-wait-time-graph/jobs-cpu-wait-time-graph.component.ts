import { Component, Input } from "@angular/core";
import { autobind } from "core-decorators";
import { List } from "immutable";
import * as moment from "moment";

import { Job } from "app/models";
import { DateUtils } from "app/utils";

import "./jobs-cpu-wait-time-graph.scss";

@Component({
    selector: "bl-jobs-cpu-wait-time-graph",
    templateUrl: "jobs-cpu-wait-time-graph.html",
})
export class JobsCpuWaitTimeGraphComponent {
    @Input() public jobs: List<Job> = List([]);

    @autobind()
    public computeDataSets(displayedJobs: List<Job>) {
        const dataCpu = displayedJobs.map((job) => {
            return job.stats.userCPUTime;
        }).toArray();
        const dataWait = displayedJobs.map((job) => {
            return job.stats.waitTime;
        }).toArray();
        return [
            {
                label: "Cpu time",
                data: dataCpu,
            },
            {
                label: "Wait time",
                data: dataWait,
            },
        ] as any;
    }

    @autobind()
    public getTooltip(job: Job) {
        const runningTime = moment.duration(moment(job.executionInfo.endTime).diff(job.executionInfo.startTime));
        return [
            `Job id: ${job.id}`,
            `Running time: ${DateUtils.prettyDuration(runningTime, true)}`,
        ];
    }
}
