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
     * @param {string} container - Name of the storage container
     * @param {string} blobPrefix - The prefix of the blob name. In our case it is the taskId prefix:
     *  "${taskId}/$TaskOutput|$TaskLog/${namePrefixFilter}"
     * @param {string} filter - Optional text for filtering further than the blob prefix
     * @param {string} continuationToken - Token that was returned from the last call, if any
     * @param {StorageRequestOptions} options - Optional request parameters
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
                                    contentLength: parseInt(blob.contentLength, 10),
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

    /**
     * Returns all user-defined metadata, standard HTTP properties, and system
     * properties for the blob.
     * http://azure.github.io/azure-storage-node/BlobService.html#getBlobProperties__anchor
     *
     * @param {string} container - Name of the storage container
     * @param {string} blobName - Name of the blob file: "myblob.txt"
     * @param {string} blobPrefix - Optional prefix to the blob from the container root: "1001/$TaskOutput/"
     * @param {StorageRequestOptions} options - Optional request parameters
     */
    public getBlobProperties(
        container: string,
        blobName: string,
        blobPrefix: string = "",
        options?: StorageRequestOptions): Promise<BlobStorageResult> {

        const blobPath = blobPrefix + blobName;
        return new Promise((resolve, reject) => {
            this._blobService.getBlobProperties(container, blobPath, options, (error, result, response) => {
                if (error) {
                    reject(error);
                } else {
                    resolve({
                        data: {
                            name: blobName,
                            url: `${container}/${blobName}`,
                            isDirectory: false,
                            properties: {
                                contentLength: parseInt(result.contentLength, 10),
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

    /**
     * Downloads a blob into a text string.
     * http://azure.github.io/azure-storage-node/BlobService.html#getBlobToText__anchor
     * @param {string} container - Name of the storage container
     * @param {string} blob - Fully prefixed blob path: "1001/$TaskOutput/myblob.txt"
     * @param {StorageRequestOptions} options - Optional request parameters
     */
    public getBlobContent(container: string, blob: string, options?: StorageRequestOptions) {
        return new Promise((resolve, reject) => {
            this._blobService.getBlobToText(container, blob, options, (error, text, blockBlob, response) => {
                if (error) {
                    reject(error);
                } else {
                    resolve({
                        content: text,
                    });
                }
            });
        });
    }

    /**
     * Downloads a blob into a file.
     * http://azure.github.io/azure-storage-node/BlobService.html#getBlobToLocalFile__anchor
     * Note: this returns a SpeedSummary object that can list the percent complete. Can't see any
     * implementation of this in the docs. Might be useful at some point.
     * @param {string} container - Name of the storage container
     * @param {string} blob - Fully prefixed blob path: "1001/$TaskOutput/myblob.txt"
     * @param {string} localFileName - The local path to the file to be downloaded.
     * @param {StorageRequestOptions} options - Optional request parameters
     */
    public getBlobToLocalFile(container: string, blob: string, localFileName: string, options?: StorageRequestOptions) {
        return new Promise((resolve, reject) => {
            this._blobService.getBlobToLocalFile(container, blob, localFileName, options, (error, result, response) => {
                if (error) {
                    reject(error);
                } else {
                    // resolve with no content
                    resolve({ });
                }
            });
        });
    }
}
