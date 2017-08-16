import { Component, OnInit } from "@angular/core";
import * as moment from "moment";

import { JobState } from "app/models";
import { JobService } from "app/services";
import { FilterBuilder } from "app/utils/filter-builder";
import "./all-job-graphs-home.scss";

@Component({
    selector: "bl-all-job-graphs-home",
    templateUrl: "all-job-graphs-home.html",
})
export class AllJobGraphsComponent implements OnInit {
    constructor(private jobService: JobService) { }

    public ngOnInit() {
        console.log("LISt all");
        // this.jobService.getOnce("0a33f946-36ae-4518-be81-3fe523b6d1fe", {
        //     select: "id,executionInfo,stats",
        // }).subscribe(job => console.log("S", job.toJS()));

        this.jobService.listAll({
            select: "id,executionInfo,stats",
            filter: FilterBuilder.prop("state").eq(JobState.completed).toOData(),
            pageSize: 1000,
        }).subscribe((jobs) => {
            console.log("LISt all2");
            jobs.filter(x => Boolean(x.stats && x.executionInfo)).forEach((x) => {
                const wait = x.stats.waitTime.asSeconds();
                const cpuTime = x.stats.wallClockTime.asSeconds();
                const realTime = moment.duration(moment(x.executionInfo.endTime).diff(x.executionInfo.startTime)).asSeconds();
                // return `${wait} + ${cpuTime} > ${wait + cpuTime} == ${realTime}`;
                const totalTasks = x.stats.numSucceededTasks + x.stats.numFailedTasks;
                const avgTimePerTask = cpuTime / totalTasks;
                const efficiency = avgTimePerTask / realTime;
                console.log(x.id, efficiency, x.stats.numSucceededTasks, totalTasks, avgTimePerTask, wait / totalTasks);
            });
        });
    }
}
