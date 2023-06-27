import { BlobUploadCommonResponse } from "@azure/storage-blob";
import { ElectronRemote } from "@batch-flask/electron";
import { IpcEvent } from "common/constants";
import { SharedAccessPolicy } from "./models";
import * as blob from "./models/storage-blob";
import { BlobContentResult } from "./storage-blob.service";

const storageIpc = IpcEvent.storageBlob;

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

    private storageInfo: { url: string; account: string, key: string };

    constructor(
        private remote: ElectronRemote,
        account: string,
        key: string,
        blobEndpoint: string
    ) {
        const url = `https://${account}.${blobEndpoint}`;
        this.storageInfo = { url, account, key };
    }

    /**
     * Lists blobs from the container that match the prefix. In our case the
     * prefix will be the taskId and the OutputKind of the task output.
     *
     * @param {string} container - Name of the storage container
     * @param {string} blobPrefix - The prefix of the blob name. In our case it is the taskId prefix:
     *  "${taskId}/$TaskOutput|$TaskLog/${namePrefixFilter}"
     * @param {string} continuationToken - Token that was returned from the last call, if any
     * @param {blob.RequestOptions} options - Optional request parameters
     */
    public async listBlobs(
        containerName: string,
        options: blob.ListBlobOptions,
        continuationToken?: string
    ): Promise<blob.ListBlobsResult> {
        return this.remote.send(storageIpc.listBlobs,
            { ...this.storageInfo, containerName, options, continuationToken });
    }

    /**
     * Returns all user-defined metadata, standard HTTP properties, and system
     * properties for the blob.
     *
     * @param {string} containerName - Name of the storage container
     * @param {string} blobName - Name of the blob file: "myblob.txt"
     * @param {string} blobPrefix - Optional prefix to the blob from the container root: "1001/$TaskOutput/"
     * @param {blob.RequestOptions} options - Optional request parameters
     */
    public async getBlobProperties(
        containerName: string,
        blobName: string,
        blobPrefix = "",
        options?: blob.RequestOptions
    ): Promise<blob.GetBlobPropertiesResult> {

        return this.remote.send(storageIpc.getBlobProperties,
            {
                ...this.storageInfo,
                containerName,
                blobName,
                blobPrefix,
                options
            }
        );
    }

    /**
     * Downloads a blob into a text string.
     *
     * @param {string} container - Name of the storage container
     * @param {string} blob - Fully prefixed blob path: "1001/$TaskOutput/myblob.txt"
     * @param {blob.RequestOptions} options - Optional request parameters
     */
    public async getBlobContent(
        containerName: string,
        blobName: string,
        options?: blob.GetBlobContentOptions
    ): Promise<BlobContentResult> {
        return this.remote.send(storageIpc.getBlobContent,
            { ...this.storageInfo, containerName, blobName, options });
    }

    /**
     * Downloads a blob into a file.
     *
     * @param {string} container - Name of the storage container
     * @param {string} blob - Fully prefixed blob path: "1001/$TaskOutput/myblob.txt"
     * @param {string} localFileName - The local path to the file to be downloaded.
     * @param {blob.RequestOptions} options - Optional request parameters
     */
    public async getBlobToLocalFile(
        containerName: string,
        blobName: string,
        localFileName: string,
        options?: blob.RequestOptions
    ): Promise<void> {
        await this.remote.send(storageIpc.downloadBlob,
            {
                ...this.storageInfo,
                containerName,
                blobName,
                localFileName,
                options
            }
        );
        return;
    }

    /**
     * Marks the specified blob or snapshot for deletion if it exists. The blob
     * is later deleted during garbage collection. If a blob has snapshots, you
     * must delete them when deleting the blob by setting the deleteSnapshots
     * option.
     *
     * @param {string} container - ID of the storage container
     * @param {string} blob - Fully prefixed blob path: "1001/$TaskOutput/myblob.txt"
     * @param {blob.RequestOptions} options - Optional request parameters
     */
    public async deleteBlobIfExists(
        containerName: string,
        blobName: string,
        options?: blob.RequestOptions
    ): Promise<boolean> {
        return this.remote.send(storageIpc.deleteBlob,
            { ...this.storageInfo, containerName, blobName, options });
    }

    /**
     * Lists a segment containing a collection of container items whose names
     * begin with the specified prefix under the specified account. By default
     * the prefix will generally be "grp-" as this is the NCJ prefix for file
     * group containers, but can aso be anything we like in order to get any
     * arbitrary container.
     *
     * @param {string} prefix - Container name prefix including filter, or null.
     * @param {string} continuationToken - Token that was returned from the last call, if any
     * @param {blob.RequestOptions} options - Optional request parameters
     */
    public async listContainersWithPrefix(
        prefix: string,
        continuationToken?: string,
        options?: blob.RequestOptions
    ): Promise<blob.ListContainersResult> {
        return this.remote.send(storageIpc.listContainers,
            { ...this.storageInfo, continuationToken, prefix, options }
        );
    }

    /**
     * Returns all user-defined metadata and system properties for the
     * specified container. The data returned does not include the container's
     * list of blobs.
     *
     * @param {string} container - Name of the storage container
     * @param {blob.RequestOptions} options - Optional request parameters
     */
    public async getContainerProperties(
        containerName: string,
        options?: blob.RequestOptions
    ): Promise<blob.GetContainerPropertiesResult> {
        return this.remote.send(storageIpc.getContainerProperties,
            { ...this.storageInfo, containerName, options });
    }

    /**
     * Marks the specified container for deletion. The container and any blobs
     * contained within it are later deleted during garbage collection.
     *
     * @param {string} container - Name of the storage container
     * @param {blob.RequestOptions} options - Optional request parameters
     */
    public async deleteContainer(
        containerName: string,
        options?: blob.RequestOptions
    ): Promise<void> {
        return this.remote.send(storageIpc.deleteContainer,
            { ...this.storageInfo, containerName, options });
    }

    /**
     * Creates a new container under the specified account.
     * If a container with the same name already exists, the operation fails.
     *
     * @param {string} container - Name of the storage container
     */
    public async createContainer(containerName: string): Promise<void> {
        return this.remote.send(storageIpc.createContainer,
            { ...this.storageInfo, containerName });
    }

    /**
     * Creates a new container under the specified account if it doesn't exists.
     *
     * @param {string} container - Name of the storage container
     * @returns {boolean} whether a new container was created
     */
    public async createContainerIfNotExists(
        containerName: string,
        options?: blob.RequestOptions
    ): Promise<boolean> {
        return this.remote.send(storageIpc.createContainer,
            {
                ...this.storageInfo,
                containerName,
                options,
                unlessExists: true
            }
        );
    }

    public async generateSasUrl(
        containerName: string,
        blobName?: string,
        accessPolicy?: SharedAccessPolicy
    ): Promise<string> {
        return this.remote.send(storageIpc.generateSasUrl,
            { ...this.storageInfo, containerName, blobName, accessPolicy });
    }

    /**
     * Retrieves a blob or container URL.
     *
     * @param {string} container - Name of the storage container
     * @param {string} blob - Optional blob name.
     * @param {string} sasToken - The Shared Access Signature token.
     */
    public getUrl(container: string, blob?: string, sasToken?: string): string {
        return [
            this.storageInfo.url,
            container,
            blob ? `/${blob}${sasToken}` : sasToken
        ].join("/");
    }

    public async uploadFile(
        containerName: string,
        fileName: string,
        blobName: string
    ): Promise<BlobUploadCommonResponse> {
        return this.remote.send(storageIpc.uploadFile,
            { ...this.storageInfo, containerName, fileName, blobName });
    }
}
