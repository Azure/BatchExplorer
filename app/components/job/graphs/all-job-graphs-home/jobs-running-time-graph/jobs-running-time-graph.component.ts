import { Component, Input } from "@angular/core";
import { List } from "immutable";
import * as moment from "moment";

import { Job } from "app/models";
import { DateUtils } from "app/utils";

import { autobind } from "@batch-flask/core";
import "./jobs-running-time-graph.scss";

@Component({
    selector: "bl-jobs-running-time-graph",
    templateUrl: "jobs-running-time-graph.html",
})
export class JobsRunningTimeComponent {

    @Input() public jobs: List<Job> = List([]);

    @autobind()
    public computeDataSets(displayedJobs: List<Job>) {
        const data = displayedJobs.map((job) => {
            return moment(job.executionInfo.endTime).diff(job.executionInfo.startTime);
        }).toArray();
        return [
            {
                label: "Running time",
                data: data,
            },
        ] as any;
    }

    @autobind()
    public getTooltip(job: Job) {
        const runningTime = moment.duration(moment(job.executionInfo.endTime).diff(job.executionInfo.startTime));
        return [
            `Job id: ${job.id}`,
            `Running time: ${DateUtils.compactDuration(runningTime, true)}`,
        ];
    }
}
