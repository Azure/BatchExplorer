import { autobind } from "core-decorators";
import { AsyncSubject, BehaviorSubject, Observable } from "rxjs";

import { BackgroundTaskService } from "app/components/base/background-task";
import { Task } from "app/models";
import { TaskService } from "app/services";
import { LongRunningDeleteAction } from "app/services/core";

// todo: refactor me along with WaitForDeleteTaskPoller
export class DeleteTaskAction extends LongRunningDeleteAction {
    constructor(private taskService: TaskService, private jobId, taskIds: string[]) {
        super("task", taskIds);
    }

    public deleteAction(id: string) {
        return this.taskService.delete(this.jobId, id);
    }

    public waitForDelete(id: string, taskManager?: BackgroundTaskService) {
        this.taskService.getOnce(this.jobId, id).subscribe({
            next: (task: Task) => {
                const poller = new WaitForDeleteTaskPoller(this.taskService, this.jobId, id);
                if (taskManager) {
                    taskManager.startTask(`Deleting task '${id}' for job '${this.jobId}'`, (bTask) => {
                        return poller.start(bTask.progress);
                    });
                } else {
                    poller.start(new BehaviorSubject<any>(-1)).subscribe({
                        complete: () => {
                            this.waitingCompleted();
                        },
                    });
                }
            },
            error: (error) => {
                // No need to watch for Task as it's already deleted
                this.waitingCompleted();
            },
        });
    }
}

// todo: refactor me ....
export class WaitForDeleteTaskPoller {
    constructor(private taskService: TaskService, private jobId, private taskId) {
    }

    @autobind()
    public start(progress: BehaviorSubject<any>): Observable<any> {
        const obs = new AsyncSubject();
        let interval = setInterval(() => {
            this.taskService.getOnce(this.jobId, this.taskId).subscribe({
                error: (e) => {
                    progress.next(100);
                    clearInterval(interval);
                    obs.complete();
                },
            });
        }, 5000);

        progress.next(-1);
        return obs.asObservable();
    }
}
