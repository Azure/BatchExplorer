import { Injectable } from "@angular/core";
import { Headers, Http, RequestOptions, RequestOptionsArgs, Response } from "@angular/http";
import { AsyncSubject, Observable } from "rxjs";

export interface CommitBlockListOptions {
    blockIds: string[];
    fileType: string;
    options?: RequestOptionsArgs;
}

/**
 * Http service for uploading files into storage
 */
@Injectable()
export class HttpUploadService {
    constructor(private http: Http) {
    }

    public putBlock(uri: string, body: Uint8Array): Observable<Response> {
        const options = new RequestOptions();
        options.headers = new Headers();
        options.headers.append("x-ms-blob-type", "BlockBlob");

        const subject = new AsyncSubject<Response>();
        this.http.put(uri, body, options).subscribe({
            next: (data) => {
                subject.next(data);
                subject.complete();
            },
            error: (e) => subject.error(e),
        });

        return subject.asObservable();
    }

    public commitBlockList(uri: string, commitOptions: CommitBlockListOptions): Observable<Response> {
        const options = commitOptions.options || new RequestOptions();
        if (!options.headers) {
            options.headers = new Headers();
        }

        options.headers.append("x-ms-blob-content-type", commitOptions.fileType);

        const subject = new AsyncSubject<Response>();
        const requestBody = this._generateBlockListXml(commitOptions.blockIds);
        this.http.put(uri, requestBody, options).subscribe({
            next: (data) => {
                subject.next(data);
                subject.complete();
            },
            error: (e) => subject.error(e),
        });

        return subject.asObservable();
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
