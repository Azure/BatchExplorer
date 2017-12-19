import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from "@angular/core";
import { MatDialogRef } from "@angular/material";
import { autobind } from "app/core";

import { BackgroundTaskService } from "app/components/base/background-task";
import { Job } from "app/models";
import { JobService, PoolService } from "app/services";
import { DeletePoolTask } from "./delete-pool-task";

@Component({
    selector: "bl-delete-pool-dialog",
    templateUrl: "delete-pool-dialog.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DeletePoolDialogComponent {
    public set poolId(poolId: string) {
        this._poolId = poolId;
        this._checkForJob();
        this.changeDetector.detectChanges();
    }
    public get poolId() { return this._poolId; }

    public hasJobWithSameName = false;
    public deleteJob = false;

    private _poolId: string;

    constructor(
        public dialogRef: MatDialogRef<DeletePoolDialogComponent>,
        private poolService: PoolService,
        private jobService: JobService,
        private taskManager: BackgroundTaskService,
        private changeDetector: ChangeDetectorRef) {
    }

    @autobind()
    public destroyPool() {
        const task = new DeletePoolTask(this.poolService, [this.poolId]);
        task.startAndWaitAsync(this.taskManager);
        if (this.deleteJob) {
            this.jobService.delete(this.poolId).subscribe();
        }
        return task.actionDone;
    }

    private _checkForJob() {
        this.jobService.get(this.poolId).subscribe({
            next: (job: Job) => {
                this.hasJobWithSameName = job.poolId === this.poolId;
                this.changeDetector.detectChanges();
            },
            error: () => {
                this.hasJobWithSameName = false;
                this.changeDetector.detectChanges();
            },
        });
    }
}
