import { BehaviorSubject } from "rxjs";

import { WaitForDeletePoller } from "app/components/application/action";
import { BackgroundTaskManager } from "app/components/base/background-task";
import { ApplicationPackage } from "app/models";
import { ApplicationService } from "app/services";
import { LongRunningDeleteAction } from "app/services/core";

export class DeletePackageAction extends LongRunningDeleteAction {
    constructor(
        private applicationService: ApplicationService,
        private applicationId: string,
        private versions: string[]) {

        super("App package", versions);
    }

    public deleteAction(version: string) {
        return this.applicationService.deletePackage(this.applicationId, version);
    }

    protected waitForDelete(version: string, taskManager?: BackgroundTaskManager) {
        this.applicationService.getPackage(this.applicationId, version).subscribe({
            next: (appPackage: ApplicationPackage) => {
                const task = new WaitForDeletePoller(this.applicationService.getPackage(this.applicationId, version));
                if (taskManager) {
                    const message = `Deleting version '${version}' of application: ${this.applicationId}`;
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
                // No need to watch for App Package it is already deleted
                this.markItemAsDeleted();
            },
        });
    }
}
