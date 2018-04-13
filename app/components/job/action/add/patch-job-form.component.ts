import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from "@angular/core";
import { FormBuilder } from "@angular/forms";
import { Observable } from "rxjs";

import { autobind } from "@batch-flask/core";
import { NotificationService } from "@batch-flask/ui/notifications";
import { SidebarRef } from "@batch-flask/ui/sidebar";
import { JobCreateDto /*JobPatchDto*/ } from "app/models/dtos";
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
    }

    @autobind()
    public submit(data: JobCreateDto): Observable<any> {
        console.log(data);
        // const patchData = new JobPatchDto({

        // });
        // const obs = this.jobService.patch(this.jobId, patchData);
        // obs.subscribe({
        //     next: () => {
        //         this.notificationService.success("Job updated!",
        //             `Job '${this.jobId}' was updated successfully!`);
        //     },
        //     error: (response: Response) => {
        //         this.notificationService.error(
        //             "Job update failed",
        //             response.toString(),
        //         );
        //     },
        // });

        return Observable.of(null);
    }
}
