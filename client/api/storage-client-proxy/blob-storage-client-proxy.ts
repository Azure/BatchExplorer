import * as storage from "azure-storage";

import { BlobStorageResult, StorageRequestOptions } from "./models";

export class BlobStorageClientProxy {
    private _blobService: storage.BlobService;

    constructor(blobService: storage.BlobService) {
        this._blobService = blobService;
    }

    /**
     * Lists blobs from the container that match the prefix. In our case the prefix will be the
     * taskId and the OutputKind of the task output.
     * http://azure.github.io/azure-storage-node/BlobService.html#listBlobsSegmentedWithPrefix__anchor
     *
     * @param container - name of the storage container
     * @param prefix - The prefix of the blob name. In our case it is the taskId prefix:
     *      (/${taskId}/$TaskOutput|$TaskLog/${namePrefixFilter})
     * @param continuationToken - any token that was returned from the last call
     */
    public listBlobsWithPrefix(
        container: string,
        prefix: string,
        continuationToken?: any,
        options?: StorageRequestOptions): Promise<BlobStorageResult> {

        return new Promise((resolve, reject) => {
            this._blobService.listBlobsSegmentedWithPrefix(container, prefix, continuationToken, options,
                (error, result, response) => {
                if (error) {
                    reject(error);
                } else {
                    resolve({
                        data: result.entries.map((blob) =>  {
                            return {
                                name: blob.name.replace(prefix, ""),
                                url: `${container}/${blob.name}`,
                                isDirectory: false,
                                properties: {
                                    contentLength: blob.contentLength,
                                    contentType: blob.contentSettings.contentType,
                                    creationTime: null,
                                    lastModified: blob.lastModified,
                                },
                            };
                        }),
                        continuationToken: result.continuationToken,
                    });
                }
            });
        });
    }

    private _mapBlobResults(blobs: storage.BlobService.BlobResult[]) {

    }
}
