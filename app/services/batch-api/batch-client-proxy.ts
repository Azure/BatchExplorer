import { BatchServiceClient } from "azure-batch";

import { JobScheduleProxy } from "./jobScheduleProxy";

export interface Options {
    account: string;
    key: string;
    url: string;
}

export class BatchClientProxy {
    public client: BatchServiceClient;

    private _jobSchedule: JobScheduleProxy;

    constructor(credentials, url) {
        this.client = new BatchServiceClient(credentials, url);

        this._jobSchedule = new JobScheduleProxy(this.client);
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
