import { BlobUploadCommonResponse, ContainerGetPropertiesResponse, CommonOptions, ContainerItem } from "@azure/storage-blob";
import { Model, Prop, Record } from "@batch-flask/core";
import { SharedAccessPolicy } from "./shared-access-policy";
import { BlobContainer } from "app/models";

// Placeholder; we don't use any options to storage-blob API requests
export type RequestOptions = Partial<CommonOptions>;

export interface BlobProperties {
    name: string;
    url: string;
    isDirectory: boolean;
    properties: {
        contentLength: number;
        contentType: string;
        creationTime: Date | string;
        lastModified?: Date | string;
    };
}

export type ContainerProperties = ContainerGetPropertiesResponse;

@Model()
export class BlobItem extends Record<BlobProperties> {
    @Prop() name: string;
    @Prop() url: string;
    @Prop() isDirectory: boolean;
    @Prop() properties: {
        contentLength: number;
        contentType: string;
        creationTime: Date | string;
        lastModified?: Date | string;
    }
}

export interface BaseParams {
    url: string;
    account: string;
    key: string;
}

export interface ContainerParams extends BaseParams {
    containerName: string;
}

export interface BlobParams extends ContainerParams {
    blobName: string;
}

export interface ListContainersParams extends BaseParams {
    prefix?: string;
    continuationToken?: string;
    options?: RequestOptions & {
        maxPages?: number;
        maxPageSize?: number;
    };
}

export interface GetBlobPropertiesParams extends BlobParams {
    blobPrefix?: string,
    options?: RequestOptions
}

export interface GetContainerPropertiesParams extends ContainerParams {
    options?: RequestOptions;
}

export interface ListBlobsParams extends ContainerParams {
    continuationToken?: string;
    options?: ListBlobOptions;
}

export interface GetBlobContentParams extends BlobParams {
    options?: GetBlobContentOptions;
}

export interface GetBlobContentOptions extends RequestOptions {
    rangeStart?: number;
    rangeEnd?: number;
}

export interface DeleteContainerParams extends ContainerParams {
    options?: RequestOptions;
}

export interface CreateContainerParams extends ContainerParams {
    unlessExists?: boolean;
    options?: RequestOptions;
}

export interface GenerateSasUrlParams extends ContainerParams {
    blobName?: string;
    accessPolicy?: SharedAccessPolicy;
}

export interface DownloadBlobParams extends BlobParams {
    localFileName: string;
    options?: RequestOptions;
}

export interface UploadFileParams extends BlobParams {
    fileName: string;
}

export interface DeleteBlobParams extends BlobParams {
    options?: RequestOptions;
}

export interface StorageBlobResult<T> {
    data: T;
    continuationToken?: string;
}

export type ListContainersResult = StorageBlobResult<ContainerItem[]>;
export type GetBlobPropertiesResult = StorageBlobResult<BlobProperties>;
export type ListBlobsResult = StorageBlobResult<BlobItem[]>;
export type GetContainerPropertiesResult =
    StorageBlobResult<ContainerProperties>;
export type UploadFileResult = BlobUploadCommonResponse;

export interface GetBlobContentResult {
    content: string;
}


export interface ListBlobOptions {
    /**
     * Filter for the path.(Relative to the prefix if given)
     */
    folder?: string;

    /**
     * If it should list all files or 1 directory deep.
     */
    recursive?: boolean;

    maxPageSize?: number;
    maxPages?: number;
}
