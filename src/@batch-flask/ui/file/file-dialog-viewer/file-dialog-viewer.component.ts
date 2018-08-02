import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from "@angular/core";
import { FileLoader } from "@batch-flask/ui/file/file-loader";

import "./file-dialog-viewer.scss";

@Component({
    selector: "bl-file-dialog-viewer",
    templateUrl: "file-dialog-viewer.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FileDialogViewerComponent {
    public set fileLoader(fileLoader: FileLoader) {
        this._fileLoader = fileLoader;
        this.changeDetector.markForCheck();
    }
    public get fileLoader() { return this._fileLoader; }
    private _fileLoader: FileLoader;

    constructor(private changeDetector: ChangeDetectorRef) {

    }
}
