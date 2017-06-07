import { autobind } from "core-decorators";
import { AsyncSubject, BehaviorSubject, Observable } from "rxjs";

import { BackgroundTaskService } from "app/components/base/background-task";
import { Job } from "app/models";
import { JobService } from "app/services";
import { LongRunningDeleteAction } from "app/services/core";

// todo: refactor me along with WaitForDeleteJobPollTask
export class DeleteJobAction extends LongRunningDeleteAction {
    constructor(private JobService: JobService, jobIds: string[]) {
        super("job", jobIds);
    }

    public deleteAction(id: string) {
        return this.JobService.delete(id);
    }

    protected waitForDelete(id: string, taskManager?: BackgroundTaskService) {
        this.JobService.getOnce(id).subscribe({
            next: (job: Job) => {
                const task = new WaitForDeleteJobPoller(this.JobService, id);
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

export class WaitForDeleteJobPoller {
    constructor(private jobService: JobService, private jobId) {
    }

    @autobind()
    public start(progress: BehaviorSubject<any>): Observable<any> {
        const obs = new AsyncSubject();
        let interval = setInterval(() => {
            this.jobService.getOnce(this.jobId).subscribe({
                error: (e) => {
                    progress.next(100);
                    clearInterval(interval);
                    obs.complete();
                },
            });
        }, 5000);

        progress.next(-1);

        return obs;
    }
}
