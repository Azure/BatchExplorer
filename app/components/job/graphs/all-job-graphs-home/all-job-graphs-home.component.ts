import { Component, OnInit } from "@angular/core";
import { List } from "immutable";

import { Job, JobState } from "app/models";
import { JobService } from "app/services";
import { FilterBuilder } from "app/utils/filter-builder";
import "./all-job-graphs-home.scss";

@Component({
    selector: "bl-all-job-graphs-home",
    templateUrl: "all-job-graphs-home.html",
})
export class AllJobGraphsComponent implements OnInit {
    public jobs: List<Job>;
    constructor(private jobService: JobService) { }

    public ngOnInit() {
        this.jobService.listAll({
            select: "id,executionInfo,stats",
            filter: FilterBuilder.prop("state").eq(JobState.completed).toOData(),
            pageSize: 1000,
        }).subscribe((jobs) => {
            this.jobs = List(jobs.filter(x => Boolean(x.stats && x.executionInfo)));
        });
    }
}
