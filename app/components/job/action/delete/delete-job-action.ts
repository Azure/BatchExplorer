import { BehaviorSubject } from "rxjs";

import { BackgroundTaskService } from "@batch-flask/ui/background-task";
import { WaitForDeletePoller } from "app/components/core/pollers";
import { Job } from "app/models";
import { JobService } from "app/services";
import { LongRunningDeleteAction } from "app/services/core";

export class DeleteJobAction extends LongRunningDeleteAction {
    constructor(private jobService: JobService, jobIds: string[]) {
        super("job", jobIds);
    }

    public deleteAction(id: string) {
        return this.jobService.delete(id);
    }

    protected waitForDelete(id: string, taskManager?: BackgroundTaskService) {
        this.jobService.get(id).subscribe({
            next: (job: Job) => {
                const task = new WaitForDeletePoller(() => this.jobService.get(id));
                if (taskManager) {
                    taskManager.startTask(`Deleting Job '${id}'`, (bTask) => {
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
                // No need to watch for Job it is already deleted
                this.markItemAsDeleted();
            },
        });
    }
}
