import { BatchServiceClient } from "azure-batch";

import { JobProxy } from "./jobProxy";
import { JobScheduleProxy } from "./jobScheduleProxy";

export interface Options {
    account: string;
    key: string;
    url: string;
}

export class BatchClientProxy {
    public client: BatchServiceClient;

    private _job: JobProxy;
    private _jobSchedule: JobScheduleProxy;

    constructor(credentials, url) {
        this.client = new BatchServiceClient(credentials, url);

        this._job = new JobProxy(this.client);
        this._jobSchedule = new JobScheduleProxy(this.client);
    }

    get job(): JobProxy {
        return this.checkProxy(this._job);
    }

    get jobSchedule(): JobScheduleProxy {
        return this.checkProxy(this._jobSchedule);
    }

    private checkProxy(proxy: any): any {
        if (!proxy) {
            throw new Error("BatchClientProxy has not been initialized, please call setOptions(options)");
        }

        return proxy;
    }
}
