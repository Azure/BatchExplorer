import { BatchServiceClient } from "azure-batch";

export interface Options {
    account: string;
    key: string;
    url: string;
}

export class BatchClientProxy {
    public client: BatchServiceClient;

    constructor(credentials, url) {
        this.client = new BatchServiceClient(credentials, url);
    }
}
