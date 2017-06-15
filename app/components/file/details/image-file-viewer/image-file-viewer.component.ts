import { Component, Input, OnChanges } from "@angular/core";
import * as path from "path";

import { LoadingStatus } from "app/components/base/loading";
import { FileSystemService } from "app/services";
import { FileLoader } from "app/services/file";
import "./image-file-viewer.scss";

@Component({
    selector: "bl-image-file-viewer",
    templateUrl: "image-file-viewer.html",
})
export class ImageFileViewerComponent implements OnChanges {
    @Input()
    public fileLoader: FileLoader;

    public src: string;
    public loadingStatus = LoadingStatus.Loading;

    constructor(private fs: FileSystemService) {

    }

    public ngOnChanges(changes) {
        this._loadImage();
    }

    private _loadImage() {
        const destination = path.join(this.fs.commonFolders.temp, "task-output", this.fileLoader.filename);
        this.loadingStatus = LoadingStatus.Loading;
        this.fileLoader.download(destination).subscribe((result) => {
            this.src = `file://${destination}`;
            this.loadingStatus = LoadingStatus.Ready;
        });
    }
}
