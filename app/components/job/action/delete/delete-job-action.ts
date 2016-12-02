import { autobind } from "core-decorators";
import { AsyncSubject, BehaviorSubject, Observable } from "rxjs";

import { BackgroundTaskManager } from "app/components/base/background-task";
import { Job } from "app/models";
import { JobService } from "app/services";
import { LongRunningDeleteAction } from "app/services/core";

// todo: refactor me along with WaitForDeleteJobPollTask
export class DeleteJobAction extends LongRunningDeleteAction {
    constructor(private JobService: JobService, private jobIds: string[]) {
        super("job", jobIds);
    }

    public deleteAction(id: string) {
        return this.JobService.delete(id);
    }

    protected waitForDelete(id: string, taskManager?: BackgroundTaskManager) {
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
        const data = this.jobService.get(this.jobId);
        const errorCallback = (e) => {
            progress.next(100);
            clearInterval(interval);
            obs.complete();
        };

        let interval = setInterval(() => {
            data.fetch().subscribe({
                error: errorCallback,
            });
        }, 5000);

        progress.next(-1);
        data.item.subscribe({
            error: errorCallback,
        });

        return obs;
    }
}
