import { ChangeDetectionStrategy, Component, Input } from "@angular/core";
import { autobind } from "app/core";
import { List } from "immutable";
import { Observable } from "rxjs/Observable";

import { EditMetadataFormComponent } from "app/components/base/form/edit-metadata-form";
import { SidebarManager } from "app/components/base/sidebar";
import { JobSchedule, Metadata } from "app/models";
import { JobScheduleDecorator } from "app/models/decorators";
// import { JobSchedulePatchDto } from "app/models/dtos";
// import { JobScheduleService } from "app/services";

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

    constructor(private sidebarManager: SidebarManager) {

    }

    @autobind()
    public editMetadata() {
        const id = this.jobSchedule.id;
        const ref = this.sidebarManager.open(`edit-job-metadata-${id}`, EditMetadataFormComponent);
        ref.component.metadata = this.jobSchedule.metadata;
        ref.component.save = (metadata) => {
            return Observable.of({});
        };
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
