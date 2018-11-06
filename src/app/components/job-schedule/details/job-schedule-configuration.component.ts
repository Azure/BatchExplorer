import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnDestroy } from "@angular/core";
import { List } from "immutable";
import { Subscription } from "rxjs";

import { WorkspaceService } from "@batch-flask/ui";
import { JobSchedule, Metadata } from "app/models";
import { JobScheduleDecorator } from "app/models/decorators";

// tslint:disable:trackBy-function
@Component({
    selector: "bl-job-schedule-configuration",
    templateUrl: "job-schedule-configuration.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JobScheduleConfigurationComponent implements OnDestroy {
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
    public jsonViewEnabled = true;

    private _jobSchedule: JobSchedule;
    private _sub: Subscription;

    constructor(
        private changeDetector: ChangeDetectorRef,
        private workspaceService: WorkspaceService) {

        this._sub = this.workspaceService.currentWorkspace.subscribe((ws) => {
            this.jsonViewEnabled = ws.isFeatureEnabled("schedule.view.configuration.json");
            this.changeDetector.markForCheck();
        });
    }

    public ngOnDestroy() {
        this._sub.unsubscribe();
    }

    public refresh(jobSchedule: JobSchedule) {
        if (this.jobSchedule) {
            this.decorator = new JobScheduleDecorator(this.jobSchedule);
            this.executionInfo = this.decorator.executionInfo || {};
            this.schedule = this.decorator.schedule || {};
            this.jobScheduleMetadata = this.jobSchedule.metadata;
        }
    }
}
