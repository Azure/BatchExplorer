import { BatchServiceClient } from "azure-batch";

import { FileProxy } from "./fileProxy";
import { JobProxy } from "./jobProxy";
import { JobScheduleProxy } from "./jobScheduleProxy";
import { TaskProxy } from "./taskProxy";

export interface Options {
    account: string;
    key: string;
    url: string;
}

export class BatchClientProxy {
    public client: BatchServiceClient;

    private _file: FileProxy;
    private _job: JobProxy;
    private _jobSchedule: JobScheduleProxy;
    private _task: TaskProxy;

    constructor(credentials, url) {
        this.client = new BatchServiceClient(credentials, url);

        this._file = new FileProxy(this.client);
        this._job = new JobProxy(this.client);
        this._jobSchedule = new JobScheduleProxy(this.client);
        this._task = new TaskProxy(this.client);
    }

    get file(): FileProxy {
        return this.checkProxy(this._file);
    }

    get job(): JobProxy {
        return this.checkProxy(this._job);
    }

    get jobSchedule(): JobScheduleProxy {
        return this.checkProxy(this._jobSchedule);
    }

    get task(): TaskProxy {
        return this.checkProxy(this._task);
    }

    private checkProxy(proxy: any): any {
        if (!proxy) {
            throw new Error("BatchClientProxy has not been initialized, please call setOptions(options)");
        }

        return proxy;
    }
}
