import { BehaviorSubject } from "rxjs";

import { WaitForDeletePoller } from "app/components/application/action";
import { BackgroundTaskManager } from "app/components/base/background-task";
import { Application } from "app/models";
import { ApplicationService } from "app/services";
import { LongRunningDeleteAction } from "app/services/core";

export class DeleteApplicationAction extends LongRunningDeleteAction {
    constructor(
        private applicationService: ApplicationService,
        private applicationIds: string[]) {

        super("Application", applicationIds);
    }

    public deleteAction(id: string) {
        return this.applicationService.delete(id);
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
