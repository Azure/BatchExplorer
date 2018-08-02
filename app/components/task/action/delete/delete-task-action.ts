import { BehaviorSubject } from "rxjs";

import { BackgroundTaskService } from "@batch-flask/ui/background-task";
import { WaitForDeletePoller } from "app/components/core/pollers";
import { Task } from "app/models";
import { TaskService } from "app/services";
import { LongRunningDeleteAction } from "@batch-flask/core";

export class DeleteTaskAction extends LongRunningDeleteAction {
    constructor(private taskService: TaskService, private jobId, taskIds: string[]) {
        super("task", taskIds);
    }

    public deleteAction(id: string) {
        return this.taskService.delete(this.jobId, id);
    }

    public waitForDelete(id: string, taskManager?: BackgroundTaskService) {
        this.taskService.get(this.jobId, id).subscribe({
            next: (task: Task) => {
                const poller = new WaitForDeletePoller(() => this.taskService.get(this.jobId, id));
                if (taskManager) {
                    taskManager.startTask(`Deleting task '${id}' for job '${this.jobId}'`, (bTask) => {
                        return poller.start(bTask.progress);
                    });
                } else {
                    poller.start(new BehaviorSubject<any>(-1)).subscribe({
                        complete: () => {
                            this.markItemAsDeleted();
                        },
                    });
                }
            },
            error: (error) => {
                // No need to watch for Task as it's already deleted
                this.markItemAsDeleted();
            },
        });
    }
}
