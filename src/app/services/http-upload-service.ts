import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { HttpRequestOptions } from "@batch-flask/core";
import { Observable } from "rxjs";

export interface CommitBlockListOptions {
    blockIds: string[];
    fileType: string;
    options?: HttpRequestOptions;
}

export interface UploadBlockOptions {
    blockId: string;
    blockContent: ArrayBuffer;
    options?: HttpRequestOptions;
}

/**
 * Http service for uploading files into storage
 */
@Injectable({providedIn: "root"})
export class HttpUploadService {
    constructor(private http: HttpClient) {
    }

    public putBlock(sasUrl: string, uploadOptions: UploadBlockOptions): Observable<any> {
        const options = this._getRequestOptionsHeader(uploadOptions.options);
        options.headers = (options.headers as any).set("x-ms-blob-type", "BlockBlob");

        // add the block id to the uri
        sasUrl = sasUrl + "&comp=block&blockid=" + uploadOptions.blockId;

        return this.http.put<any>(sasUrl, uploadOptions.blockContent, options);
    }

    public commitBlockList(sasUrl: string, commitOptions: CommitBlockListOptions): Observable<any> {
        const options = this._getRequestOptionsHeader(commitOptions.options);
        options.headers = (options.headers as any).set("x-ms-blob-content-type", commitOptions.fileType);

        // add the commit block list parameter
        sasUrl = sasUrl + "&comp=blocklist";

        const requestBody = this._generateBlockListXml(commitOptions.blockIds);
        return this.http.put<any>(sasUrl, requestBody, options);
    }

    private _getRequestOptionsHeader(originalOptions?: HttpRequestOptions): HttpRequestOptions {
        const options = originalOptions || {};

        if (!options.headers) {
            options.headers = new HttpHeaders();
        }

        return options;
    }

    private _generateBlockListXml(blockIds: string[]): string {
        // TODO: does this really need to be XML???
        let requestBody = "<?xml version=\"1.0\" encoding=\"utf-8\"?><BlockList>";
        for (const blockId of blockIds) {
            requestBody += `<Latest>${blockId}</Latest>`;
        }

        requestBody += "</BlockList>";
        return requestBody;
    }
}
