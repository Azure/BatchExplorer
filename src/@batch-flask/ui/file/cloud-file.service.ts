import { HttpClient, HttpResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { DialogService } from "@batch-flask/ui/dialogs";
import { FileSystemService } from "@batch-flask/ui/electron";
import { EncodingUtils } from "@batch-flask/utils";
import { Observable, from } from "rxjs";
import { flatMap, map, share } from "rxjs/operators";
import { FileLoadOptions, FileLoadResult, FileLoader } from "./file-loader";
import { FileDialogViewerComponent } from "./file-viewer";
import { File } from "./file.model";

@Injectable()
export class CloudFileService {
    constructor(
        private dialogService: DialogService,
        private http: HttpClient,
        private fs: FileSystemService) { }

    public openFile(url: string) {
        const ref = this.dialogService.open(FileDialogViewerComponent);
        ref.componentInstance.fileLoader = this.getFileLoader(url);
    }

    public getFileLoader(url: string) {
        const filename = this._getFilenameFromUrl(url);
        return new FileLoader({
            filename,
            source: "url",
            fs: this.fs,
            properties: () => this._getFileProperties(url, filename),
            content: (options: FileLoadOptions) => this._getFileContent(url),
        });
    }

    private _getFileProperties(url: string, filename: string): Observable<File> {
        return this.http.head(url, { observe: "response" }).pipe(
            map((response: HttpResponse<void>) => {
                return new File({
                    name: filename,
                    url: url,
                    isDirectory: false,
                    properties: {
                        contentLength: Number(response.headers.get("Content-Length")),
                        lastModified: response.headers.get("Last-Modified"),
                    },
                });
            }),
        );
    }

    private _getFileContent(url: string): Observable<FileLoadResult> {
        return this.http.get(url, { observe: "response", responseType: "arraybuffer" }).pipe(
            flatMap((response) => from(this._readContent(response))),
            share(),
        );
    }

    private async _readContent(response: HttpResponse<ArrayBuffer>): Promise<{ content: string }> {
        const buffer = response.body;

        const { encoding } = await EncodingUtils.detectEncodingFromBuffer({
            buffer: new Buffer(buffer),
            bytesRead: buffer.byteLength,
        });
        return { content: new TextDecoder(encoding || "utf-8").decode(buffer) };
    }

    private _getFilenameFromUrl(url: string) {
        const parsedUrl = new URL(url);
        const filename = parsedUrl.pathname;
        if (filename[0] === "/") {
            return filename.slice(1);
        } else {
            return filename;
        }
    }
}
