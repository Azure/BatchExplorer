import { Component, Input, OnChanges } from "@angular/core";

import { LoadingStatus } from "app/components/base/loading";
import { FileLoader } from "app/services/file";
import "./image-file-viewer.scss";

@Component({
    selector: "bl-image-file-viewer",
    templateUrl: "image-file-viewer.html",
})
export class ImageFileViewerComponent implements OnChanges {
    @Input() public fileLoader: FileLoader;

    public src: string;
    public loadingStatus = LoadingStatus.Loading;

    public ngOnChanges(changes) {
        this._loadImage();
    }

    private _loadImage() {
        this.loadingStatus = LoadingStatus.Loading;
        this.fileLoader.cache().subscribe((destination) => {
            this.src = `file://${destination}`;
            this.loadingStatus = LoadingStatus.Ready;
        });
    }
}
