import { ChangeDetectionStrategy, Component, Input } from "@angular/core";
import { List } from "immutable";

import { JobSchedule, Metadata } from "app/models";
import { JobScheduleDecorator } from "app/models/decorators";

// tslint:disable:trackBy-function
@Component({
    selector: "bl-job-schedule-configuration",
    templateUrl: "job-schedule-configuration.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JobScheduleConfigurationComponent {
    @Input()
    public set jobSchedule(jobSchedule: JobSchedule) {
        this._jobSchedule = jobSchedule;
        this.refresh(jobSchedule);
    }
    public get jobSchedule() { return this._jobSchedule; }

    public decorator: JobScheduleDecorator = { } as any;
    public executionInfo: any = {};
    public schedule: any = {};
    public jobScheduleMetadata: List<Metadata> = List([]);

    private _jobSchedule: JobSchedule;

    public refresh(jobSchedule: JobSchedule) {
        if (this.jobSchedule) {
            this.decorator = new JobScheduleDecorator(this.jobSchedule);
            this.executionInfo = this.decorator.executionInfo || {};
            this.schedule = this.decorator.schedule || {};
            this.jobScheduleMetadata = this.jobSchedule.metadata;
        }
    }
}
