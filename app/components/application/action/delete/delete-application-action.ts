import { BehaviorSubject } from "rxjs";

import { BackgroundTaskManager } from "app/components/base/background-task";
import { Application } from "app/models";
import { ApplicationService } from "app/services";
import { LongRunningDeleteAction } from "app/services/core";
import { WaitForDeletePoller } from "./";

export class DeleteApplicationAction extends LongRunningDeleteAction {
    constructor(
        private applicationService: ApplicationService,
        private applicationId: string) {

        super("Application", [applicationId]);
    }

    public deleteAction() {
        return this.applicationService.delete(this.applicationId);
    }

    protected waitForDelete(id: string, taskManager?: BackgroundTaskManager) {
        this.applicationService.getOnce(id).subscribe({
            next: (application: Application) => {
                const task = new WaitForDeletePoller(this.applicationService.get(id));
                if (taskManager) {
                    const message = `Deleting application: ${id}`;
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
                // No need to watch for App it is already deleted
                this.markItemAsDeleted();
            },
        });
    }
}
