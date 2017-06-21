import { ChangeDetectionStrategy, Component, Input } from "@angular/core";
import { List } from "immutable";

import { Job, Metadata, NameValuePair } from "app/models";
import {
    JobDecorator,
    JobManagerTaskDecorator,
    JobPreparationTaskDecorator,
    JobReleaseTaskDecorator,
} from "app/models/decorators";

@Component({
    selector: "bl-job-configuration",
    templateUrl: "job-configuration.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JobConfigurationComponent {
    @Input()
    public set job(job: Job) {
        this._job = job;
        this.refresh(job);
    }
    public get job() { return this._job; }

    public decorator: JobDecorator = { usesTaskDependencies: false } as any;
    public constraints: any = {};
    public executionInfo: any = {};
    public managerTask: JobManagerTaskDecorator;
    public prepTask: JobPreparationTaskDecorator;
    public releaseTask: JobReleaseTaskDecorator;
    public environmentSettings: List<NameValuePair> = List([]);
    public jobMetadata: List<Metadata> = List([]);
    public poolInfo: any = {};

    private _job: Job;

    public refresh(job: Job) {
        if (this.job) {
            this.decorator = new JobDecorator(this.job);
            this.constraints = this.decorator.constraints || {};
            this.executionInfo = this.decorator.executionInfo || {};
            this.managerTask = this.decorator.jobManagerTask;
            this.prepTask = this.decorator.jobPreparationTask;
            this.releaseTask = this.decorator.jobReleaseTask;
            this.poolInfo = this.decorator.poolInfo || {};
            this.environmentSettings = this.job.commonEnvironmentSettings;
            this.jobMetadata = this.job.metadata;
        }
    }
}
