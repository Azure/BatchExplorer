import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from "@angular/core";
import { FormBuilder } from "@angular/forms";
import { autobind } from "@batch-flask/core";
import { NotificationService } from "@batch-flask/ui/notifications";
import { SidebarRef } from "@batch-flask/ui/sidebar";
import { JobScheduleCreateDto, JobSchedulePatchDto } from "app/models/dtos";
import { JobScheduleService } from "app/services";
import { Observable } from "rxjs";
import { JobScheduleCreateBasicDialogComponent } from "./job-schedule-create-basic-dialog.component";

@Component({
    selector: "bl-patch-job-schedule-form",
    templateUrl: "job-schedule-create-basic-dialog.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PatchJobScheduleComponent extends JobScheduleCreateBasicDialogComponent {
    private _jobScheduleId: string;
    public get jobScheduleId() {
        return this._jobScheduleId;
    }
    public set jobScheduleId(jobScheduleId: string) {
        this._jobScheduleId = jobScheduleId;
        this.title = `Edit job schedule ${jobScheduleId}`;
        this.changeDetector.detectChanges();
    }

    constructor(
        formBuilder: FormBuilder,
        sidebarRef: SidebarRef<JobScheduleCreateBasicDialogComponent>,
        jobScheduleService: JobScheduleService,
        notificationService: NotificationService,
        private changeDetector: ChangeDetectorRef) {
        super(formBuilder, sidebarRef, jobScheduleService, notificationService);
        this.title = "Edit job schedule";
        this.disable("id");
        this.disable("displayName");
    }

    @autobind()
    public submit(data: JobScheduleCreateDto): Observable<any> {
        const patchData = new JobSchedulePatchDto({
            jobSpecification: data.jobSpecification,
            schedule: data.schedule,
            metadata: data.metadata,
        });
        const obs = this.jobScheduleService.patch(this.jobScheduleId, patchData);
        obs.subscribe({
            next: () => {
                this.notificationService.success("Job schedule updated!",
                    `Job schedule '${this.jobScheduleId}' was updated successfully!`);
            },
            error: (response: any) => {
                const detailReason = Array.isArray(response.details)
                && response.details.find(detail => detail.key === "Reason");
                this.notificationService.error(
                    "Job schedule update failed",
                    `${response.message}. ` +
                    `${detailReason ? detailReason.value : ""}`,
                );
            },
        });

        return obs;
    }
}
