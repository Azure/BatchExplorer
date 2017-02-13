import { autobind } from "core-decorators";
import { AsyncSubject, BehaviorSubject, Observable } from "rxjs";

import { BackgroundTaskManager } from "app/components/base/background-task";
import { ApplicationPackage } from "app/models";
import { ApplicationService } from "app/services";
import { LongRunningDeleteAction } from "app/services/core";

// todo: refactor me along with WaitForDeletePoller
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
                const getFunc = this.applicationService.getPackage(this.applicationId, version);
                const task = new WaitForDeletePoller(this.applicationService, getFunc);
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

export class WaitForDeletePoller {
    constructor(
        private jobService: ApplicationService,
        private getFunction: any) {
    }

    @autobind()
    public start(progress: BehaviorSubject<any>): Observable<any> {
        const obs = new AsyncSubject();
        const errorCallback = (e) => {
            progress.next(100);
            clearInterval(interval);
            obs.complete();
        };

        let interval = setInterval(() => {
            this.getFunction.fetch().subscribe({
                error: errorCallback,
            });
        }, 5000);

        progress.next(-1);
        this.getFunction.item.subscribe({
            error: errorCallback,
        });

        return obs;
    }
}
