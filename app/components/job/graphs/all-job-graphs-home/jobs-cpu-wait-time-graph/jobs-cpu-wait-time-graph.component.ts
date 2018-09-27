import { Component, Input } from "@angular/core";
import { autobind } from "@batch-flask/core";
import { List } from "immutable";
import * as moment from "moment";

import { Job } from "app/models";
import { DateUtils } from "@batch-flask/utils";

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
            return job.stats.userCPUTime.asMilliseconds();
        }).toArray();
        const dataWait = displayedJobs.map((job) => {
            return job.stats.waitTime.asMilliseconds();
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
            "",
            `Running time: ${DateUtils.compactDuration(runningTime, true)}`,
            `Cpu time: ${DateUtils.compactDuration(job.stats.userCPUTime, true)}`,
            `Waiting time: ${DateUtils.compactDuration(job.stats.waitTime, true)}`,
        ];
    }
}
