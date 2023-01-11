import { Injectable } from "@angular/core";
import { BlobHierarchyListSegment, BlobSASPermissions, BlobServiceClient, ContainerSASPermissions, StorageSharedKeyCredential } from "@azure/storage-blob";
import { autobind } from "@batch-flask/core";
import { EncodingUtils } from "@batch-flask/utils";
import * as blob from "app/services/storage/models/storage-blob";
import { IpcEvent } from "common/constants";
import { BlIpcMain } from "../bl-ipc-main";


const storageIpc = IpcEvent.storageBlob;

const MAX_CONTAINER_LIST_PAGE_SIZE = 100;
const MAX_BLOB_LIST_PAGE_SIZE = 200;

@Injectable({ providedIn: "root" })
export class StorageBlobAdapter {
    constructor(private ipcMain: BlIpcMain) {
    }

    public init() {
        // TODO: Replace with method decorators?
        this.ipcMain.on(storageIpc.listContainers, this.listContainers);
        this.ipcMain.on(storageIpc.getContainerProperties,
            this.getContainerProperties);
        this.ipcMain.on(storageIpc.deleteContainer, this.deleteContainer);
        this.ipcMain.on(storageIpc.createContainer, this.createContainer);

        this.ipcMain.on(storageIpc.listBlobs, this.listBlobs);
        this.ipcMain.on(storageIpc.getBlobProperties, this.getBlobProperties);
        this.ipcMain.on(storageIpc.getBlobContent, this.getBlobContent);
        this.ipcMain.on(storageIpc.generateSasUrl, this.generateSasUrl);
        this.ipcMain.on(storageIpc.downloadBlob, this.downloadBlob);
        this.ipcMain.on(storageIpc.uploadFile, this.uploadFile);
        this.ipcMain.on(storageIpc.deleteBlob, this.deleteBlob);
    }

    @autobind()
    public async listContainers(params: blob.ListContainersParams):
        Promise<blob.ListContainersResult> {
        const { prefix, continuationToken, options = {} } = params;
        const client = this.getServiceClient(params);
        const containers = [];

        const { maxPageSize = MAX_CONTAINER_LIST_PAGE_SIZE, maxPages } =
            options;

        const pages = client.listContainers({ prefix }).byPage({
            maxPageSize: maxPageSize,
            // byPage() treats null token as valid, returning 0 pages
            continuationToken: continuationToken ?? undefined
        });

        let pageIndex = 0;
        let nextToken;
        for await (const page of pages) {
            pageIndex++;
            nextToken = page.continuationToken;
            for (const container of page.containerItems) {
                containers.push({
                    ...container.properties,
                    metadata: container.metadata,
                    version: container.version,
                    deleted: container.deleted,
                    id: container.name
                });
            }
            nextToken = page.continuationToken;
            if (maxPages && pageIndex >= maxPages) {
                break;
            }
        }
        return {
            data: containers,
            continuationToken: nextToken
        };
    }

    @autobind()
    public async getBlobProperties(params: blob.GetBlobPropertiesParams):
        Promise<blob.GetBlobPropertiesResult> {
        const { containerName, blobName, blobPrefix = "", options } = params;

        const client = this.getBlobClient(params);
        const blobPath = blobPrefix + blobName;
        const props = await client.getProperties(options);

        return {
            data: {
                name: blobName,
                url: `${containerName}/${blobPath}`,
                isDirectory: false,
                properties: {
                    contentLength: props.contentLength,
                    contentType: props.contentType,
                    creationTime: props.createdOn,
                    lastModified: props.lastModified,
                },
            },
        };
    }

    @autobind()
    public async getContainerProperties(
        params: blob.GetContainerPropertiesParams
    ): Promise<blob.GetContainerPropertiesResult> {

        const client = this.getContainerClient(params);
        const props = await client.getProperties(params.options);

        return { data: props };
    }

    @autobind()
    public async listBlobs(params: blob.ListBlobsParams):
        Promise<blob.ListBlobsResult> {
        const { containerName, options = {}, continuationToken } = params;
        const {
            folder: prefix,
            maxPageSize = MAX_BLOB_LIST_PAGE_SIZE,
            maxPages,
            recursive
        } = options;
        const client = this.getContainerClient(params);
        const blobs = [];

        const pages = (recursive
            ? client.listBlobsFlat({ prefix })
            : client.listBlobsByHierarchy("/", { prefix })
        ).byPage({
            maxPageSize,
            // byPage() treats null token as valid, returning 0 pages
            continuationToken: continuationToken ?? undefined
        });

        let pageIndex = 0;
        let nextToken;
        for await (const page of pages) {
            pageIndex++;
            const segment = page.segment;
            nextToken = page.continuationToken;
            if (!recursive) {
                for (const prefix of (segment as BlobHierarchyListSegment).blobPrefixes) {
                    blobs.push({
                        name: prefix.name,
                        url: `${containerName}/${prefix.name}`,
                        isDirectory: true
                    });
                }
            }
            for (const blob of segment.blobItems) {
                blobs.push({
                    name: blob.name,
                    url: `${containerName}/${blob.name}`,
                    isDirectory: false,
                    properties: {
                        contentLength: blob.properties.contentLength,
                        contentType: blob.properties.contentType,
                        creationTime: blob.properties.createdOn,
                        lastModified: blob.properties.lastModified,
                    }
                });
            }
            if (maxPages && pageIndex >= maxPages) {
                break;
            }
        }

        return { data: blobs, continuationToken: nextToken };
    }

    @autobind()
    public async getBlobContent(params: blob.GetBlobContentParams):
        Promise<blob.GetBlobContentResult> {
        const { options } = params;
        const client = this.getBlobClient(params);
        const buffer = await client.downloadToBuffer(0, null, options);

        const { encoding } = await EncodingUtils.detectEncodingFromBuffer({ buffer, bytesRead: buffer.length });
        let content;
        if (encoding) {
            content = new TextDecoder(encoding).decode(buffer);
        } else {
            content = buffer.toString();
        }

        return { content };
    }

    @autobind()
    public async deleteContainer(params: blob.DeleteContainerParams):
        Promise<void> {
        const { containerName, options } = params;
        const client = this.getServiceClient(params);
        await client.deleteContainer(containerName, options);
        return;
    }

    @autobind()
    public async createContainer(params: blob.CreateContainerParams):
        Promise<boolean> {
        const { containerName, unlessExists = false, options } = params;
        if (unlessExists) {
            const client = this.getContainerClient(params);
            const response = await client.createIfNotExists(options);
            return response.succeeded;
        } else {
            await this.getServiceClient(params).createContainer(containerName);
            return true;
        }
    }

    @autobind()
    public async generateSasUrl(params: blob.GenerateSasUrlParams):
        Promise<string> {
        const { blobName, accessPolicy } = params;
        const permissions = accessPolicy.AccessPolicy.Permissions;
        if (blobName) {
            return this.getBlobClient(
                params as blob.BlobParams
            ).generateSasUrl({
                permissions: BlobSASPermissions.parse(permissions.join(""))
            });
        } else {
            return this.getContainerClient(params).generateSasUrl({
                permissions: ContainerSASPermissions.parse(permissions.join(""))
            });
        }
    }

    @autobind()
    public async downloadBlob(params: blob.DownloadBlobParams):
        Promise<void> {
        const { localFileName, options } = params;
        const client = this.getBlobClient(params);
        await client.downloadToFile(localFileName, undefined, undefined,
            options);
        return;
    }

    @autobind()
    public async uploadFile(params: blob.UploadFileParams):
        Promise<blob.UploadFileResult> {
        return this.getBlobClient(params).uploadFile(params.fileName);
    }

    @autobind()
    public async deleteBlob(params: blob.DeleteBlobParams):
        Promise<boolean> {
        const client = this.getBlobClient(params);
        const response = await client.deleteIfExists(params.options);
        return response.succeeded;
    }

    private getServiceClient(params: blob.BaseParams) {
        const { url, account, key } = params;
        const credential = new StorageSharedKeyCredential(account, key);
        return new BlobServiceClient(url, credential);
    }

    private getContainerClient(params: blob.ContainerParams) {
        const { containerName } = params;
        return this.getServiceClient(params).getContainerClient(containerName);
    }

    private getBlobClient(params: blob.BlobParams) {
        const { blobName } = params;
        return this.getContainerClient(params).getBlockBlobClient(blobName);
    }
}
