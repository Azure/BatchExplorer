import { Component, Input, OnChanges } from "@angular/core";

import { LoadingStatus } from "app/components/base/loading";
import { File, ServerError } from "app/models";
import { FileLoader } from "app/services/file";
import { Constants } from "app/utils";
import "./code-file-viewer.scss";

const maxSize = 100000; // 100KB

@Component({
    selector: "bl-code-file-viewer",
    templateUrl: "code-file-viewer.html",
})
export class CodeFileViewerComponent implements OnChanges {
    @Input() public fileLoader: FileLoader;

    public value: string = "";
    public file: File;
    public loadingStatus: LoadingStatus = LoadingStatus.Loading;
    public fileTooLarge: boolean;
    public fileNotFound = false;

    public config: CodeMirror.EditorConfiguration = {
        readOnly: true,
        lineNumbers: true,
    };

    public ngOnChanges(changes) {
        this._loadImage();
    }

    private _loadImage() {
        this.fileTooLarge = false;
        this.loadingStatus = LoadingStatus.Loading;
        this.fileNotFound = false;
        this.fileLoader.getProperties().subscribe({
            next: (file: File) => {
                this.file = file;
                const contentLength = file.properties.contentLength;
                if (contentLength > maxSize) {
                    this.fileTooLarge = true;
                    this.loadingStatus = LoadingStatus.Ready;
                    return;
                }

                this.fileLoader.content().subscribe((result) => {
                    this.value = result.content.toString();
                    this.loadingStatus = LoadingStatus.Ready;
                });
            },
            error: (error) => null,
        });

    }
}
