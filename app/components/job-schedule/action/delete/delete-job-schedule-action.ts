import { BehaviorSubject } from "rxjs";

import { BackgroundTaskService } from "@batch-flask/ui/background-task";
import { WaitForDeletePoller } from "app/components/core/pollers";
import { JobSchedule } from "app/models";
import { JobScheduleService } from "app/services";
import { LongRunningDeleteAction } from "app/services/core";

export class DeleteJobScheduleAction extends LongRunningDeleteAction {
    constructor(private jobScheduleService: JobScheduleService, jobScheduleIds: string[]) {
        super("jobschedule", jobScheduleIds);
    }

    public deleteAction(id: string) {
        return this.jobScheduleService.delete(id);
    }

    protected waitForDelete(id: string, taskManager?: BackgroundTaskService) {
        this.jobScheduleService.get(id).subscribe({
            next: (jobSchedule: JobSchedule) => {
                const task = new WaitForDeletePoller(() => this.jobScheduleService.get(id));
                if (taskManager) {
                    taskManager.startTask(`Deleting Job Schedule '${id}'`, (bTask) => {
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
                // No need to watch for Job schedule it is already deleted
                this.markItemAsDeleted();
            },
        });
    }
}
