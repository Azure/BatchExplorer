import { Observable, of } from "rxjs";

import { Activity, ActivityService } from "@batch-flask/ui";
import { WaitForDeletePoller } from "app/components/core/pollers";
import { BatchApplication } from "app/models";
import { ApplicationService } from "app/services";
import { LongRunningDeleteAction } from "app/services/core";
import { catchError, map } from "rxjs/operators";

export class DeleteApplicationAction extends LongRunningDeleteAction {
    constructor(
        private applicationService: ApplicationService,
        private activityService: ActivityService,
        applicationIds: string[]) {

        super("Application", applicationIds);
    }

    /**
     * Delete the package versions first and then remove the parent
     * application container.
     */
    public deleteAction(id: string) {
        return this.applicationService.get(id)
            .flatMap((app) => {
                const packageArray = app.packages.toArray();
                const observable = Observable.interval(100).take(packageArray.length);
                return observable.flatMap((i) => {
                    return this.applicationService.deletePackage(id, packageArray[i].version);
                });
            }).last().flatMap(() => {
                return this.applicationService.delete(id);
            }).share();
    }

    protected waitForDelete(id: string) {
        // prepare the initializer function, which will delete the application
        const initializer = () => {
            return this.applicationService.get(id).pipe(
                // if an application with this ID exists, delete it
                map((application: BatchApplication) => {
                    const deletionPoller = new WaitForDeletePoller(() => this.applicationService.get(id));
                    return deletionPoller.start();
                }),
                // if an applcation with this ID does not exist, pipe through a dummy observable to complete the task
                catchError((error, caught) => {
                    return of("foo");
                }),
            );
        };

        const activity = new Activity(`Deleting application: ${id}`, initializer);
        this.activityService.loadAndRun(activity);
    }
}
