import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnChanges } from "@angular/core";
import { FileLoader } from "@batch-flask/ui/file/file-loader";
import { File } from "@batch-flask/ui/file/file.model";
import { DateUtils, prettyBytes } from "@batch-flask/utils";
import { Subscription } from "rxjs";
import { FileViewer } from "../../file-viewer";

import "./file-viewer-header.scss";

@Component({
    selector: "bl-file-viewer-header",
    templateUrl: "file-viewer-header.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FileViewerHeaderComponent implements OnChanges {
    @Input() public fileLoader: FileLoader;
    @Input() public fileViewer: FileViewer | null;

    public filename: string;
    public contentSize: string = "-";
    public lastModified: string = "-";
    public file: File;
    private _propertiesSub: Subscription;

    constructor(private changeDetector: ChangeDetectorRef) {

    }

    public ngOnChanges(inputs) {
        if (inputs.fileLoader) {
            this.filename = this.fileLoader && this.fileLoader.displayName;
        }

        this._clearPropertiesSub();
        this._propertiesSub = this.fileLoader.properties.subscribe((file) => {
            this.file = file;
            this.contentSize = prettyBytes(file.properties.contentLength);
            this.lastModified = DateUtils.prettyDate(file.properties.lastModified);
            this.changeDetector.markForCheck();
        });
    }

    private _clearPropertiesSub() {
        if (this._propertiesSub) {
            this._propertiesSub.unsubscribe();
        }
    }
}
