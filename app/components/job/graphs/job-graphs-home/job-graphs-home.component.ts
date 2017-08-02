import { Component, OnDestroy, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";

import { Job } from "app/models";
import { JobParams, JobService } from "app/services";
import { RxEntityProxy } from "app/services/core";
import "./job-graphs-home.scss";

@Component({
    selector: "bl-job-graphs-home",
    templateUrl: "job-graphs-home.html",
})
export class JobGraphsComponent implements OnInit, OnDestroy {
    public job: Job;
    public jobId: string;
    private _data: RxEntityProxy<JobParams, Job>;

    constructor(
        private route: ActivatedRoute,
        private jobService: JobService) {

        this._data = this.jobService.get(null, {});
        this._data.item.subscribe((job) => {
            this.job = job;
        });

    }

    public ngOnInit() {
        this.route.params.subscribe((params) => {
            this.jobId = params["jobId"];
            this._data.params = { id: this.jobId };
            this._data.fetch();
        });
    }

    public ngOnDestroy() {
        this._data.dispose();
    }
}
