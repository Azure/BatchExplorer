import { Component, Input } from "@angular/core";
import { autobind } from "@batch-flask/core";
import { DateUtils } from "@batch-flask/utils";
import { Job } from "app/models";
import { List } from "immutable";
import { DateTime } from "luxon";

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
            return DateTime.fromJSDate(job.executionInfo.endTime).diff(
                DateTime.fromJSDate(job.executionInfo.startTime));
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
        const runningTime = DateTime.fromJSDate(job.executionInfo.endTime).diff(
            DateTime.fromJSDate(job.executionInfo.startTime));
        return [
            `Job id: ${job.id}`,
            `Running time: ${DateUtils.compactDuration(runningTime, true)}`,
        ];
    }
}
