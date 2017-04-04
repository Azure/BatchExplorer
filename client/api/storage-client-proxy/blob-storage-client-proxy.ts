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
     * @param blobPrefix - The prefix of the blob name. In our case it is the taskId prefix:
     *  "${taskId}/$TaskOutput|$TaskLog/${namePrefixFilter}"
     * @param filter - optional text for filtering further than the blob prefix
     * @param continuationToken - token that was returned from the last call, if any
     */
    public listBlobsWithPrefix(
        container: string,
        blobPrefix: string,
        filter?: string,
        continuationToken?: any,
        options?: StorageRequestOptions): Promise<BlobStorageResult> {

        // we want to keep the filter and prefix separate for mapping files in the response.
        const prefix = filter
            ? blobPrefix + filter
            : blobPrefix;

        return new Promise((resolve, reject) => {
            this._blobService.listBlobsSegmentedWithPrefix(container, prefix, continuationToken, options,
                (error, result, response) => {
                if (error) {
                    reject(error);
                } else {
                    resolve({
                        data: result.entries.map((blob) =>  {
                            return {
                                name: blob.name.replace(blobPrefix, ""),
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

    // TODO: commment header
    public getBlobProperties(
        container: string,
        blobname: string,
        options?: StorageRequestOptions): Promise<BlobStorageResult> {

        return new Promise((resolve, reject) => {
            this._blobService.getBlobProperties(container, blobname, options, (error, result, response) => {
                if (error) {
                    reject(error);
                } else {
                    resolve({
                        data: {
                            name: blobname,
                            url: `${container}/${blobname}`,
                            isDirectory: false,
                            properties: {
                                contentLength: result.contentLength,
                                contentType: result.contentSettings.contentType,
                                creationTime: null,
                                lastModified: result.lastModified,
                            },
                        },
                    });
                }
            });
        });
    }
}
