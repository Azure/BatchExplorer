import { Component, Input, OnDestroy, ViewContainerRef } from "@angular/core";
import { Job } from "app/models";
import { JobDecorator } from "app/models/decorators";

@Component({
    selector: "bex-job-properties",
    template: require("./job-properties.html"),
})

export class JobPropertiesComponent implements OnDestroy {
    @Input()
    public set job(job: Job) {
        this._job = job;
        this.refresh(job);
    }
    public get job() { return this._job; }

    public decorator: JobDecorator = <any>{ usesTaskDependencies: false };
    public constraints: any = {};
    public executionInfo: any = {};
    public jobManagerTask: any = {};
    public jobPreparationTask: any = {};
    public jobReleaseTask: any = {};
    public poolInfo: any = {};

    private _job: Job;

    constructor(
        private viewContainerRef: ViewContainerRef) {
    }

    public refresh(job: Job) {
        if (this.job) {
            this.decorator = new JobDecorator(this.job);
            this.constraints = this.decorator.constraints || {};
            this.executionInfo = this.decorator.executionInfo || {};
            this.jobManagerTask = this.decorator.jobManagerTask || {};
            this.jobPreparationTask = this.decorator.jobPreparationTask || {};
            this.jobReleaseTask = this.decorator.jobReleaseTask || {};
            this.poolInfo = this.decorator.poolInfo || {};
        }
    }

    public ngOnDestroy() {
        /* tab hide */
    }
}
