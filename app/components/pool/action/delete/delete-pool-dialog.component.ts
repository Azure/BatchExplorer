import { Component } from "@angular/core";
import { MdDialogRef } from "@angular/material";
import { autobind } from "core-decorators";

import { BackgroundTaskManager } from "app/components/base/background-task";
import { PoolService } from "app/services";
import { DeletePoolTask } from "./delete-pool-task";

@Component({
    selector: "bex-delete-pool-dialog",
    templateUrl: "./delete-pool-dialog.html",
})

export class DeletePoolDialogComponent {
    public poolId: string;

    constructor(
        public dialogRef: MdDialogRef<DeletePoolDialogComponent>,
        private poolService: PoolService,
        private taskManager: BackgroundTaskManager) {
    }

    @autobind()
    public destroyPool() {
        const task = new DeletePoolTask(this.poolService, [this.poolId]);
        task.startAndWaitAsync(this.taskManager);
        task.actionDone.subscribe({
            complete: () => {
                // Close after 500ms so we can see the animation
                setTimeout(() => {
                    this.dialogRef.close();
                }, 500);
            },
        });
        return task.actionDone;
    }
}
