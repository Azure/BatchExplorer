import { Component, Input, ViewContainerRef } from "@angular/core";

import { Job, NameValuePair } from "app/models";

@Component({
    selector: "bl-job-metadata",
    templateUrl: "job-metadata.html",
})
export class JobMetadataComponent {
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
}
