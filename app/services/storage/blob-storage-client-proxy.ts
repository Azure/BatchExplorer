import { BlobService } from "azure-storage";

import { EncodingUtils } from "@batch-flask/utils";
import { BlobStorageResult, SharedAccessPolicy, StorageRequestOptions } from "./models";

export interface ListBlobOptions {
    /**
     * Filter for the path.(Relative to the prefix if given)
     */
    folder?: string;

    /**
     * If it should list all files or 1 directory deep.
     */
    recursive?: boolean;
}

export interface ListBlobResponse {
    body: {
        EnumerationResults: {
            Blobs: {
                Blob: any | any[],
                BlobPrefix: any | any[],
            },
        },
    };
}

export class BlobStorageClientProxy {
    public client: BlobService;

    constructor(blobService: BlobService) {
        this.client = blobService;
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
    public listBlobs(
        container: string,
        options: ListBlobOptions = {},
        continuationToken?: any): Promise<BlobStorageResult> {

        // we want to keep the filter and prefix separate for mapping files in the response.
        const prefix = options.folder;
        const storageOptions: StorageRequestOptions = {
            delimiter: options.recursive ? null : "/",
        };
        return new Promise((resolve, reject) => {
            this.client.listBlobsSegmentedWithPrefix(container, prefix, continuationToken, storageOptions,
                (error, result, response: any) => {
                    if (error) { return reject(error); }

                    const folders = this._getFolderNames(response).map((name) => {
                        return {
                            name: name,
                            url: `${container}/${name}`,
                            isDirectory: true,
                        };
                    });

                    resolve({
                        data: folders.concat(result.entries.map((blob) => {
                            return {
                                name: blob.name,
                                url: `${container}/${blob.name}`,
                                isDirectory: false,
                                properties: {
                                    contentLength: parseInt(blob.contentLength, 10),
                                    contentType: blob.contentSettings.contentType,
                                    creationTime: null,
                                    lastModified: blob.lastModified,
                                },
                            };
                        })),
                        continuationToken: result.continuationToken,
                    });
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
        blobPrefix?: string,
        options?: StorageRequestOptions): Promise<BlobStorageResult> {

        const blobPath = `${blobPrefix || ""}${blobName}`;
        return new Promise((resolve, reject) => {
            this.client.getBlobProperties(container, blobPath, options, (error, result, response) => {
                if (error) {
                    reject(error);
                } else {
                    resolve({
                        data: {
                            name: blobName,
                            url: `${container}/${blobPath}`,
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
            const chunks = [];
            let encoding = null;
            const stream = this.client.createReadStream(container, blob, options, (error, text, response) => {
                if (error) {
                    reject(error);
                }
            });
            stream.on("data", (chunk) => {
                chunks.push(chunk);
                if (!encoding) {
                    const result = EncodingUtils.detectEncodingFromBuffer({ buffer: chunk, bytesRead: chunk.length });
                    if (result) {
                        encoding = result.encoding;
                    }
                    console.log("Encoding result is", result);
                }
            });

            stream.on("end", () => {
                console.log("stream finish", chunks);
                const buffer = Buffer.concat(chunks);
                if (encoding) {
                    console.log("Herere", new TextDecoder(encoding).decode(buffer));
                    resolve({ content: new TextDecoder(encoding).decode(buffer) });
                }
                resolve({ content: buffer.toString() });
            });

            stream.on("error", (error) => {
                reject(error);
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
            this.client.getBlobToLocalFile(container, blob, localFileName, options, (error, result, response) => {
                if (error) {
                    reject(error);
                } else {
                    // resolve with no content
                    resolve({});
                }
            });
        });
    }

    /**
     * Marks the specified blob or snapshot for deletion if it exists. The blob is later deleted during
     * garbage collection. If a blob has snapshots, you must delete them when deleting the blob by setting
     * the deleteSnapshots option.
     * http://azure.github.io/azure-storage-node/BlobService.html#deleteBlobIfExists__anchor
     *
     * @param {string} container - ID of the storage container
     * @param {string} blob - Fully prefixed blob path: "1001/$TaskOutput/myblob.txt"
     * @param {StorageRequestOptions} options - Optional request parameters
     */
    public deleteBlobIfExists(container: string, blob: string, options?: StorageRequestOptions)
        : Promise<boolean> {

        return new Promise((resolve, reject) => {
            this.client.deleteBlobIfExists(container, blob, options, (error, response) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(response);
                }
            });
        });
    }

    /**
     * Lists a segment containing a collection of container items whose names begin with the specified
     * prefix under the specified account. By default the prefix will generally be "grp-" as this is the
     * NCJ prefix for file group containers, but can aso be anything we like in order to get any
     * arbritrary container.
     * http://azure.github.io/azure-storage-node/BlobService.html#listContainersSegmentedWithPrefix__anchor
     *
     * @param {string} prefix - Container name prefix including filter, or null.
     * @param {string} filter - Filter in addition to name prefix.
     * @param {string} continuationToken - Token that was returned from the last call, if any
     * @param {StorageRequestOptions} options - Optional request parameters
     */
    public listContainersWithPrefix(
        startswith: string,
        continuationToken?: any,
        options?: StorageRequestOptions): Promise<BlobStorageResult> {

        return new Promise((resolve, reject) => {
            this.client.listContainersSegmentedWithPrefix(startswith, continuationToken, options,
                (error, result, response) => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve({
                            data: result.entries.map((container) => {
                                return {
                                    ...container,
                                    id: container.name,
                                };
                            }),
                            continuationToken: result.continuationToken,
                        });
                    }
                });
        });
    }

    /**
     * Returns all user-defined metadata and system properties for the specified container.
     * The data returned does not include the container's list of blobs.
     * http://azure.github.io/azure-storage-node/BlobService.html#getContainerProperties__anchor
     *
     * @param {string} container - Name of the storage container
     * @param {string} prefix - Container name prefix to be remove from the display name.
     * @param {StorageRequestOptions} options - Optional request parameters
     */
    public getContainerProperties(container: string, prefix: string, options?: StorageRequestOptions)
        : Promise<BlobStorageResult> {

        return new Promise((resolve, reject) => {
            this.client.getContainerProperties(container, options, (error, result, response) => {
                if (error) {
                    reject(error);
                } else {
                    resolve({
                        data: {
                            ...result,
                            id: result.name,
                        },
                    });
                }
            });
        });
    }

    /**
     * Marks the specified container for deletion. The container and any blobs contained within
     * it are later deleted during garbage collection.
     * http://azure.github.io/azure-storage-node/BlobService.html#deleteContainer__anchor
     *
     * @param {string} container - Name of the storage container
     * @param {StorageRequestOptions} options - Optional request parameters
     */
    public deleteContainer(container: string, options?: StorageRequestOptions)
        : Promise<BlobStorageResult> {

        return new Promise((resolve, reject) => {
            this.client.deleteContainer(container, options, (error, response) => {
                if (error) {
                    reject(error);
                } else {
                    resolve();
                }
            });
        });
    }

    /**
     * Creates a new container under the specified account.
     * If a container with the same name already exists, the operation fails.
     * http://azure.github.io/azure-storage-node/BlobService.html#createContainer__anchor
     *
     * @param {string} container - Name of the storage container
     */
    public createContainer(containerName: string)
        : Promise<BlobStorageResult> {

        return new Promise((resolve, reject) => {
            this.client.createContainer(containerName, (error, response) => {
                if (error) {
                    reject(error);
                } else {
                    resolve();
                }
            });
        });
    }

    /**
     * Creates a new container under the specified account if it doesn't exsits.
     *
     * @param {string} container - Name of the storage container
     */
    public createContainerIfNotExists(containerName: string)
        : Promise<BlobStorageResult> {

        return new Promise((resolve, reject) => {
            this.client.createContainerIfNotExists(containerName, (error, response) => {
                if (error) {
                    reject(error);
                } else {
                    resolve();
                }
            });
        });
    }

    /**
     * Retrieves a shared access signature token.
     * http://azure.github.io/azure-storage-node/BlobService.html#generateSharedAccessSignature__anchor
     *
     * @param {string} container - Name of the storage container
     * @param {string} sharedAccessPolicy - The shared access policy
     */
    public generateSharedAccessSignature(
        container: string, blob: string, sharedAccessPolicy: SharedAccessPolicy): string {
        return this.client.generateSharedAccessSignature(container, blob, sharedAccessPolicy, null);
    }

    /**
     * Retrieves a blob or container URL.
     * http://azure.github.io/azure-storage-node/BlobService.html#getUrl__anchor
     *
     * @param {string} container - Name of the storage container
     * @param {string} blob - Optional blob name.
     * @param {string} sasToken - The Shared Access Signature token.
     */
    public getUrl(container: string, blob?: string, sasToken?: string): string {
        return this.client.getUrl(container, blob, sasToken);
    }

    public async uploadFile(container: string, file: string, remotePath: string): Promise<BlobService.BlobResult> {
        return new Promise<BlobService.BlobResult>((resolve, reject) => {
            this.client.createBlockBlobFromLocalFile(container, remotePath, file,
                (error: any, result: BlobService.BlobResult) => {
                    if (error) { return reject(error); }
                    resolve(result);
                });
        });
    }

    /**
     * Return the list of folder names return by listing blobs with a delimiter
     * @param response
     */
    private _getFolderNames(response: ListBlobResponse) {
        const results = response.body["EnumerationResults"]["Blobs"];
        const blobPrefix = results["BlobPrefix"];
        if (!blobPrefix) {
            return [];
        }
        const data = Array.isArray(blobPrefix) ? blobPrefix : [blobPrefix];
        return data.map(x => x["Name"].slice(0, -1));
    }
}
