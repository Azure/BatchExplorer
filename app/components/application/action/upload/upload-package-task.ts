// TODO :: Work in progress
// import { autobind } from "@batch-flask/core";
// import { AsyncSubject, BehaviorSubject, Observable } from "rxjs";

import { BackgroundTaskService } from "@batch-flask/ui/background-task";
// import { Pool } from "app/models";
import { PoolService } from "app/services";
import { LongRunningUploadAction } from "app/services/core";

export class UploadPackageTask extends LongRunningUploadAction {
    constructor(poolService: PoolService, poolIds: string[]) {
        super("pool", poolIds);
    }

    protected uploadAction(id) {
        // call an uploader here
        return null;
    }

    protected waitForUpload(filename: string, taskManager?: BackgroundTaskService) {
        // this.poolService.get(id).subscribe({
        //     next: (pool: Pool) => {
        //         const task = new WaitForDeletePoolPollTask(this.poolService, id, pool.currentDedicated);
        //         if (taskManager) {
        //             taskManager.startTask(`Deleting pool '${id}'`, (bTask) => {
        //                 return task.start(bTask.progress);
        //             });
        //         } else {
        //             task.start(new BehaviorSubject(-1)).subscribe({
        //                 complete: () => {
        //                     this.markItemAsDeleted();
        //                 },
        //             });
        //         }
        //     },
        //     error: (error) => {
        //         this.markItemAsDeleted();
        //     },
        // });
    }
}

// export class WaitForDeletePoolPollTask {
//     constructor(
//         private poolService: PoolService,
//         private poolId,
//         private originalNodes: number,
//         private refreshRate = 5000) {

//         if (!this.originalNodes) {
//             this.originalNodes = 1;
//         }
//     }

//     @autobind()
//     public start(progress: BehaviorSubject<any>): Observable<any> {
//         const obs = new AsyncSubject();
//         const data = this.poolService.get(this.poolId);
//         let interval;

//         const errorCallback = (e) => {
//             progress.next(100);
//             clearInterval(interval);
//             obs.complete();
//         };

//         interval = setInterval(() => {
//             data.fetch().subscribe({
//                 error: errorCallback,
//             });
//         }, this.refreshRate);

//         progress.next(10);
//         data.item.subscribe({
//             next: (pool: Pool) => {
//                 if (pool) {
//                     const currentNodes = pool.currentDedicated;
//                     progress.next(this._getProgress(currentNodes));
//                 }
//             },
//             error: errorCallback,
//         });

//         return obs;
//     }

//     private _getProgress(currentNodes: number) {
//         return 10 + 80 * (this.originalNodes - currentNodes / this.originalNodes);
//     }
// }
