import { BatchServiceClient } from "azure-batch";

import AccountProxy from "./accountProxy";
import { FileProxy } from "./fileProxy";
import { JobProxy } from "./jobProxy";
import { NodeProxy } from "./nodeProxy";
import { PoolProxy } from "./poolProxy";
import { TaskProxy } from "./taskProxy";

export interface Options {
    account: string;
    key: string;
    url: string;
}

export class BatchClientProxy {
    public client: BatchServiceClient;

    private _account: AccountProxy;
    private _file: FileProxy;
    private _job: JobProxy;
    private _pool: PoolProxy;
    private _task: TaskProxy;
    private _node: NodeProxy;

    constructor(credentials, url) {
        this.client = new BatchServiceClient(credentials, url);

        this._account = new AccountProxy(this.client);
        this._file = new FileProxy(this.client);
        this._job = new JobProxy(this.client);
        this._pool = new PoolProxy(this.client);
        this._task = new TaskProxy(this.client);
        this._node = new NodeProxy(this.client);
    }

    get account(): AccountProxy {
        return this.checkProxy(this._account);
    }

    get file(): FileProxy {
        return this.checkProxy(this._file);
    }

    get job(): JobProxy {
        return this.checkProxy(this._job);
    }

    get task(): TaskProxy {
        return this.checkProxy(this._task);
    }

    get pool(): PoolProxy {
        return this.checkProxy(this._pool);
    }

    get node(): NodeProxy {
        return this.checkProxy(this._node);
    }

    private checkProxy(proxy: any): any {
        if (!proxy) {
            throw new Error("BatchClientProxy has not been initialized, please call setOptions(options)");
        }

        return proxy;
    }
}
