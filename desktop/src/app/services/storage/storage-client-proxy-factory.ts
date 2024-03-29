import { ElectronRemote } from "@batch-flask/electron";
import { BlobStorageClientProxy } from "./blob-storage-client-proxy";

export interface StorageAccountSharedKeyOptions {
    account: string;
    key: string;
    endpoint: string;
}

/**
 * Return storage client proxy built for the given credentials. Currently we use name/key
 * auth for storage, but we may be able to use AAD as well like for the batch client proxy
 */
export class StorageClientProxyFactory {
    // For shared key
    private _sharedKeyOptions: StorageAccountSharedKeyOptions = {} as any;
    private _blobSharedKeyClient: BlobStorageClientProxy = null;

    constructor(private remote: ElectronRemote) { }

    public async getBlobServiceForSharedKey(options: StorageAccountSharedKeyOptions) {
        if (!this._compareSharedKeyOptions(options)) {
            this._sharedKeyOptions = options;

            this._blobSharedKeyClient = new BlobStorageClientProxy(
                this.remote,
                options.account, options.key,
                `blob.${options.endpoint}`
            );
        }

        return this._blobSharedKeyClient;
    }

    /**
     * Compare the current options with the new ones we are setting
     * to see if they have changed.
     * @param options - storage account name and shared key
     */
    private _compareSharedKeyOptions(options: StorageAccountSharedKeyOptions): boolean {
        return this._blobSharedKeyClient
            && options.account === this._sharedKeyOptions.account
            && options.key === this._sharedKeyOptions.key;
    }
}
