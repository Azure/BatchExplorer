import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from "@angular/core";
import { FormBuilder } from "@angular/forms";
import { Observable } from "rxjs";

import { autobind } from "@batch-flask/core";
import { NotificationService } from "@batch-flask/ui/notifications";
import { SidebarRef } from "@batch-flask/ui/sidebar";
import { JobState } from "app/models/azure-batch/job/job";
import { JobCreateDto, JobPatchDto } from "app/models/dtos";
import { JobService, PoolService } from "app/services";
import { JobCreateBasicDialogComponent } from "./job-create-basic-dialog.component";

@Component({
    selector: "bl-patch-job-form",
    templateUrl: "job-create-basic-dialog.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PatchJobComponent extends JobCreateBasicDialogComponent {
    private _jobId: string;
    public get jobId() {
        return this._jobId;
    }
    public set jobId(jobId: string) {
        this._jobId = jobId;
        this.title = `Edit job ${jobId}`;
        this.changeDetector.detectChanges();
    }

    constructor(
        formBuilder: FormBuilder,
        sidebarRef: SidebarRef<JobCreateBasicDialogComponent>,
        jobService: JobService,
        poolService: PoolService,
        notificationService: NotificationService,
        private changeDetector: ChangeDetectorRef) {
        super(formBuilder, sidebarRef, jobService, poolService, notificationService);
        this.title = "Edit job";
        this.disable("id");
        this.disable("displayName");
        this.disable("jobManagerTask");
        this.disable("jobPreparationTask");
        this.disable("jobReleaseTask");
        this.disable("onTaskFailure");
    }

    @autobind()
    public submit(data: JobCreateDto): Observable<any> {
        const poolInfo = (data.poolInfo.poolId || data.poolInfo.autoPoolSpecification)
            ? data.poolInfo : null;
        const patchData = new JobPatchDto({
            constraints: data.constraints,
            poolInfo: poolInfo,
            priority: data.priority,
            onAllTasksComplete: data.onAllTasksComplete,
            metadata: data.metadata,
        });
        const obs = this.jobService.patch(this.jobId, patchData);
        obs.subscribe({
            next: () => {
                this.notificationService.success("Job updated!",
                    `Job '${this.jobId}' was updated successfully!`);
            },
            error: (response: any) => {
                const detailReason = Array.isArray(response.details)
                    && response.details.find(detail => detail.key === "Reason");
                this.notificationService.error(
                    "Job update failed",
                    `${response.message}. ` +
                    `${detailReason ? detailReason.value : ""}`,
                );
            },
        });
        return obs;
    }

    public checkJobStateForPoolPicker(jobState: JobState) {
        if (jobState !== JobState.disabled) {
            this.subtitle = "Job's pool infomation can only be modified when job is in disabled state";
            this.disable("poolInfo");
        }
    }
}
