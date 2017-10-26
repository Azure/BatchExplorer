import { BehaviorSubject } from "rxjs";

import { BackgroundTaskService } from "app/components/base/background-task";
import { WaitForDeletePoller } from "app/components/core/pollers";
import { BlobContainer } from "app/models";
import { StorageService } from "app/services";
import { LongRunningDeleteAction } from "app/services/core";

export class DeleteContainerAction extends LongRunningDeleteAction {
    constructor(
        private storageService: StorageService,
        containerIds: string[]) {

        super("Container", containerIds);
    }

    public deleteAction(id: string) {
        return this.storageService.deleteContainer(id);
    }

    protected waitForDelete(id: string, taskManager?: BackgroundTaskService) {
        this.storageService.getContainerOnce(id).subscribe({
            next: (container: BlobContainer) => {
                const task = new WaitForDeletePoller(() => this.storageService.getContainerOnce(id));
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
