import { Component, Input, OnDestroy, ViewContainerRef } from "@angular/core";
import { Job, NameValuePair } from "app/models";

@Component({
    selector: "bex-job-metadata",
    template: require("./job-metadata.html"),
})

export class JobMetadataComponent implements OnDestroy {
    @Input()
    public set job(job: Job) {
        this._job = job;
        this.refresh(job);
    }
    public get job() { return this._job; }
    public jobMetadata: NameValuePair[] = [];

    private _job: Job;

    constructor(
        private viewContainerRef: ViewContainerRef) {
    }

    public refresh(job: Job) {
        if (this.job) {
            this.jobMetadata = this.job.metadata || [];
        }
    }

    public ngOnDestroy() {
        /* tab hide */
    }
}
