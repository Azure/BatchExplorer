import { Component, Input, OnDestroy, ViewContainerRef } from "@angular/core";

import { Job } from "app/models";
import {
    JobDecorator,
    JobManagerTaskDecorator,
    JobPreparationTaskDecorator,
    JobReleaseTaskDecorator,
} from "app/models/decorators";

@Component({
    selector: "bex-job-properties",
    templateUrl: "job-properties.html",
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
    public managerTask: JobManagerTaskDecorator;
    public prepTask: JobPreparationTaskDecorator;
    public releaseTask: JobReleaseTaskDecorator;
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
            this.managerTask = this.decorator.jobManagerTask;
            this.prepTask = this.decorator.jobPreparationTask;
            this.releaseTask = this.decorator.jobReleaseTask;
            this.poolInfo = this.decorator.poolInfo || {};
        }
    }

    public ngOnDestroy() {
        /* tab hide */
    }
}
