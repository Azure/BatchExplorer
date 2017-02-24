import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from "@angular/core";
import { MdDialogRef } from "@angular/material";
import { autobind } from "core-decorators";

import { BackgroundTaskService } from "app/components/base/background-task";
import { PoolService } from "app/services";
import { DeletePoolTask } from "./delete-pool-task";

@Component({
    selector: "bl-delete-pool-dialog",
    templateUrl: "delete-pool-dialog.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DeletePoolDialogComponent {
    public set poolId(poolId: string) {
        this._poolId = poolId;
        this.changeDetector.detectChanges();
    }
    public get poolId() { return this._poolId; };

    private _poolId: string;

    constructor(
        public dialogRef: MdDialogRef<DeletePoolDialogComponent>,
        private poolService: PoolService,
        private taskManager: BackgroundTaskService,
        private changeDetector: ChangeDetectorRef) {
    }

    @autobind()
    public destroyPool() {
        const task = new DeletePoolTask(this.poolService, [this.poolId]);
        task.startAndWaitAsync(this.taskManager);
        return task.actionDone;
    }
}
