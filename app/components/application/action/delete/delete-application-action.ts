import { BackgroundTaskService } from "@batch-flask/ui/background-task";
import { WaitForDeletePoller } from "app/components/core/pollers";
import { BatchApplication } from "app/models";
import { ApplicationService } from "app/services";
import { LongRunningDeleteAction } from "app/services/core";
import { BehaviorSubject, interval } from "rxjs";
import { flatMap, last, share, take } from "rxjs/operators";

export class DeleteApplicationAction extends LongRunningDeleteAction {
    constructor(
        private applicationService: ApplicationService,
        applicationIds: string[]) {

        super("Application", applicationIds);
    }

    /**
     * Delete the package versions first and then remove the parent
     * application container.
     */
    public deleteAction(id: string) {
        return this.applicationService.get(id).pipe(
            flatMap((app) => {
                const packageArray = app.packages.toArray();
                return interval(100).pipe(
                    take(packageArray.length),
                    flatMap((i) => {
                        return this.applicationService.deletePackage(id, packageArray[i].version);
                    }),
                );
            }),
            last(),
            flatMap(() => this.applicationService.delete(id)),
            share(),
        );
    }

    protected waitForDelete(id: string, taskManager?: BackgroundTaskService) {
        this.applicationService.get(id).subscribe({
            next: (application: BatchApplication) => {
                const task = new WaitForDeletePoller(() => this.applicationService.get(id));
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
