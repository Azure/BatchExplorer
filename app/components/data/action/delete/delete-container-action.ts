import { BehaviorSubject } from "rxjs";

import { BackgroundTaskService } from "@batch-flask/ui/background-task";
import { WaitForDeletePoller } from "app/components/core/pollers";
import { BlobContainer } from "app/models";
import { LongRunningDeleteAction } from "app/services/core";
import { StorageContainerService } from "app/services/storage";

export class DeleteContainerAction extends LongRunningDeleteAction {
    constructor(
        private storageContainerService: StorageContainerService,
        private storageAccountId: string,
        containerIds: string[]) {

        super("Container", containerIds);
    }

    public deleteAction(id: string) {
        return this.storageContainerService.delete(this.storageAccountId, id);
    }

    protected waitForDelete(id: string, taskManager?: BackgroundTaskService) {
        this.storageContainerService.get(this.storageAccountId, id).subscribe({
            next: (container: BlobContainer) => {
                const task = new WaitForDeletePoller(() => this.storageContainerService.get(this.storageAccountId, id));
                if (taskManager) {
                    const message = `Deleting container: ${id}`;
                    taskManager.startTask(message, (bTask) => {
                        return task.start(bTask.progress);
                    });
                } else {
                    task.start(new BehaviorSubject<any>(-1)).subscribe({
                        complete: () => {
                            this.markItemAsDeleted();
                        },
                    });
                }
            },
            error: (error) => {
                this.markItemAsDeleted();
            },
        });
    }
}
