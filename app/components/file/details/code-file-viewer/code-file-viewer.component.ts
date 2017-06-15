import { Component, Input, OnChanges } from "@angular/core";

import { LoadingStatus } from "app/components/base/loading";
import { FileLoader } from "app/services/file";
import "./code-file-viewer.scss";

@Component({
    selector: "bl-code-file-viewer",
    templateUrl: "code-file-viewer.html",
})
export class CodeFileViewerComponent implements OnChanges {
    @Input() public fileLoader: FileLoader;

    public value: string = "";

    public loadingStatus: LoadingStatus = LoadingStatus.Loading;

    public config: CodeMirror.EditorConfiguration = {
        readOnly: true,
        lineNumbers: true,
    };

    public ngOnChanges(changes) {
        this._loadImage();
    }

    private _loadImage() {
        this.loadingStatus = LoadingStatus.Loading;
        this.fileLoader.content().subscribe((result) => {
            this.value = result.content.toString();
            this.loadingStatus = LoadingStatus.Ready;
        });
    }
}
