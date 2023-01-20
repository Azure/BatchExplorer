import { BlobBeginCopyFromURLResponse, BlobDownloadResponseParsed, BlobGetPropertiesResponse, BlobUploadCommonResponse, BlockBlobClient, PollerLike, PollOperationState, StorageSharedKeyCredential } from "@azure/storage-blob";
import * as fs from "fs";
import * as path from "path";

interface Manifest {
    version?: string;
    buildType?: string;
    files?: [
        {
            path?: string;
            remotePath?: string;
        }
    ];
}

export function getManifest(os: string): Manifest {
    const filePath = path.join(os, "manifest.json");
    if (!fs.existsSync(filePath)) {
        throw new Error(`Manifest path ${filePath} does not exist`);
    }
    return JSON.parse(fs.readFileSync(filePath).toString()) || {};
}

export function getContainerName(buildType: string): string {
    switch (buildType) {
        case "stable":
            return "stable";
        case "insider":
            return "insider";
        default:
            return "test";
    }
}


export function storageURL(
    account: string,
    container?: string,
    blob?: string
): string {
    let url = `https://${account}.blob.core.windows.net`;
    if (container) {
        url = `${url}/${container}`;
        if (blob) {
            url = `${url}/${blob}`;
        }
    }
    return url;
}

export type CopyPoller = PollerLike<
    PollOperationState<BlobBeginCopyFromURLResponse>,
    BlobBeginCopyFromURLResponse
>;
export class BlobStorageClient {
    private credential: StorageSharedKeyCredential;
    constructor(private accountName: string, accountKey: string) {
        this.credential = new StorageSharedKeyCredential(accountName,
            accountKey);
    }

    private getBlobClient(container: string, blob: string) {
        return new BlockBlobClient(
            storageURL(this.accountName, container, blob),
            this.credential
        )
    }

    public getUrl(container: string, blob: string): string {
        return storageURL(this.accountName, container, blob);
    }

    public async createBlob(
        container: string,
        blob: string,
        filename: string,
        override = true
    ):
        Promise<BlobUploadCommonResponse> {
        const blobClient = this.getBlobClient(container, blob);
        const conditions = override ? {} : { ifNoneMatch: "*" };
        const response = await blobClient.uploadFile(filename, { conditions });
        return response;
    }

    public async getBlob(container: string, blob: string):
        Promise<BlobDownloadResponseParsed> {
        return this.getBlobClient(container, blob).download(0);
    }

    public async getBlobProperties(container: string, blob: string):
        Promise<BlobGetPropertiesResponse> {
        return this.getBlobClient(container, blob).getProperties();
    }

    public async beginCopyBlob(source: string, container: string, blob: string):
        Promise<CopyPoller> {
        const client = this.getBlobClient(container, blob);
        return client.beginCopyFromURL(source, {
            intervalInMs: 5000,
            onProgress(state) {
                console.log(`Copy "${blob}" is pending ${state.copyProgress}`);
            },
        })
    }
}
