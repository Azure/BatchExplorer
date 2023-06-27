import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from "@angular/core";
import { MatDialogRef } from "@angular/material/dialog";
import { autobind } from "@batch-flask/core";
import { ConfirmationDialog } from "@batch-flask/ui";
import { Job, Pool } from "app/models";
import { JobService } from "app/services";

export interface DeletePoolOutput {
    deleteJob: boolean;
}

@Component({
    selector: "bl-delete-pool-dialog",
    templateUrl: "delete-pool-dialog.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DeletePoolDialogComponent extends ConfirmationDialog<DeletePoolOutput>  {
    public set pools(pools: Pool[]) {
        this._pools = pools;
        this.hasJobWithSameName = false;
        if (pools.length === 1) {
            this._checkForJob();
        }
        this.changeDetector.detectChanges();
    }
    public get pools() { return this._pools; }

    public hasJobWithSameName = false;
    public deleteJob = false;

    private _pools: Pool[];

    constructor(
        public dialogRef: MatDialogRef<DeletePoolDialogComponent>,
        private jobService: JobService,
        private changeDetector: ChangeDetectorRef) {
        super();
    }

    public get title() {
        const size = this._pools.length;
        if (size > 1) {
            return `Are you sure you want to delete ${size} pools`;
        } else {
            const pool = this._pools.first();
            return `Are you sure you want to delete ${pool && pool.id}`;
        }
    }

    @autobind()
    public destroyPool() {
        this.markAsConfirmed({ deleteJob: this.deleteJob });
    }

    private _checkForJob() {
        const poolId = this.pools.first().id;
        this.jobService.get(poolId).subscribe({
            next: (job: Job) => {
                this.hasJobWithSameName = job.poolId === poolId;
                this.changeDetector.detectChanges();
            },
            error: () => {
                this.hasJobWithSameName = false;
                this.changeDetector.detectChanges();
            },
        });
    }
}
