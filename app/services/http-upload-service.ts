import { Injectable } from "@angular/core";
import { Headers, Http, RequestOptions, RequestOptionsArgs, Response } from "@angular/http";
import { AsyncSubject, Observable } from "rxjs";

export interface CommitBlockListOptions {
    blockIds: string[];
    fileType: string;
    options?: RequestOptionsArgs;
}

export interface UploadBlockOptions {
    blockId: string;
    blockContent: ArrayBuffer;
    options?: RequestOptionsArgs;
}

/**
 * Http service for uploading files into storage
 */
@Injectable()
export class HttpUploadService {
    constructor(private http: Http) {
    }

    public putBlock(sasUrl: string, uploadOptions: UploadBlockOptions): Observable<Response> {
        const options = this._getRequestOptionsHeader(uploadOptions.options);
        options.headers.append("x-ms-blob-type", "BlockBlob");

        // add the block id to the uri
        sasUrl = sasUrl + "&comp=block&blockid=" + uploadOptions.blockId;

        const subject = new AsyncSubject<Response>();
        this.http.put(sasUrl, uploadOptions.blockContent, options).subscribe({
            next: (data) => {
                subject.next(data);
                subject.complete();
            },
            error: (e) => subject.error(e),
        });

        return subject.asObservable();
    }

    public commitBlockList(sasUrl: string, commitOptions: CommitBlockListOptions): Observable<Response> {
        const options = this._getRequestOptionsHeader(commitOptions.options);
        options.headers.append("x-ms-blob-content-type", commitOptions.fileType);

        // add the commit block list parameter
        sasUrl = sasUrl + "&comp=blocklist";

        const subject = new AsyncSubject<Response>();
        const requestBody = this._generateBlockListXml(commitOptions.blockIds);
        this.http.put(sasUrl, requestBody, options).subscribe({
            next: (data) => {
                subject.next(data);
                subject.complete();
            },
            error: (e) => subject.error(e),
        });

        return subject.asObservable();
    }

    private _getRequestOptionsHeader(originalOptions?: RequestOptionsArgs): RequestOptions {
        const options = originalOptions
            ? new RequestOptions(originalOptions)
            : new RequestOptions();

        if (!options.headers) {
            options.headers = new Headers();
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
