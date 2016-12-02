import BatchClientProxy from "./batch-client-proxy";
import StorageClientProxy from "./storage-client-proxy";

// tslint:disable-next-line
export const BatchClient = BatchClientProxy;
// tslint:disable-next-line
export const StorageClient = StorageClientProxy;

export default { BatchClient, StorageClient };
