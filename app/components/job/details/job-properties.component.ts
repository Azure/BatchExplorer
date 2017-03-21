import { ChangeDetectionStrategy, Component, Input, ViewContainerRef } from "@angular/core";

import { Job } from "app/models";
import {
    JobDecorator,
    JobManagerTaskDecorator,
    JobPreparationTaskDecorator,
    JobReleaseTaskDecorator,
} from "app/models/decorators";

@Component({
    selector: "bl-job-properties",
    templateUrl: "job-properties.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JobPropertiesComponent {
    @Input()
    public set job(job: Job) {
        this._job = job;
        if (job && job.executionInfo) {
            this.hasStartTime = Boolean(job.executionInfo.startTime);
            this.hasEndTime = Boolean(job.executionInfo.endTime);
        }

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
    public hasStartTime: boolean;
    public hasEndTime: boolean;

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
}
