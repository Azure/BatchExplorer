import { autobind } from "@batch-flask/core";
import { BackgroundTaskService } from "@batch-flask/ui/background-task";
import { Pool } from "app/models";
import { PoolService } from "app/services";
import { LongRunningDeleteAction } from "app/services/core";
import { AsyncSubject, BehaviorSubject, Observable } from "rxjs";

export class DeletePoolTask extends LongRunningDeleteAction {
    constructor(private poolService: PoolService, poolIds: string[]) {
        super("pool", poolIds);
    }

    protected deleteAction(id) {
        return this.poolService.delete(id);
    }

    protected waitForDelete(id: string, taskManager?: BackgroundTaskService) {
        this.poolService.get(id).subscribe({
            next: (pool: Pool) => {
                const task = new WaitForDeletePoolPollTask(this.poolService, id, pool.currentNodes);
                if (taskManager) {
                    taskManager.startTask(`Deleting pool '${id}'`, (bTask) => {
                        return task.start(bTask.progress);
                    });
                } else {
                    task.start(new BehaviorSubject(-1)).subscribe({
                        complete: () => {
                            this.markItemAsDeleted();
                        },
                    });
                }
            },
            error: (error) => {
                this.markItemAsDeleted();
            },
        });
    }
}

export class WaitForDeletePoolPollTask {
    constructor(
        private poolService: PoolService,
        private poolId,
        private originalNodes: number,
        private refreshRate = 5000) {

        if (!this.originalNodes) {
            this.originalNodes = 1;
        }
    }

    @autobind()
    public start(progress: BehaviorSubject<any>): Observable<any> {
        const obs = new AsyncSubject();
        let interval;

        interval = setInterval(() => {
            this.poolService.get(this.poolId).subscribe({
                next: (pool: Pool) => {
                    if (pool) {
                        const currentNodes = pool.currentNodes;
                        progress.next(this._getProgress(currentNodes));
                    }
                },
                error: (e) => {
                    progress.next(100);
                    clearInterval(interval);
                    obs.complete();
                },
            });
        }, this.refreshRate);

        progress.next(10);

        return obs;
    }

    private _getProgress(currentNodes: number) {
        return 10 + 80 * (this.originalNodes - currentNodes / this.originalNodes);
    }
}
