import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy } from "@angular/core";
import { LoadingStatus } from "@batch-flask/ui/loading";
import { FileViewer } from "../file-viewer";

import "./image-file-viewer.scss";

@Component({
    selector: "bl-image-file-viewer",
    templateUrl: "image-file-viewer.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ImageFileViewerComponent extends FileViewer implements OnDestroy {
    public src: string;
    public imageDescription: string;
    public loadingStatus = LoadingStatus.Loading;

    constructor(changeDetector: ChangeDetectorRef) {
        super(changeDetector);
    }

    public onFileLoaderChanges() {
        this._loadImage();
        this._updateImageDescription();
    }

    public onFileChanges() {
        this._loadImage();
    }

    private _loadImage() {
        this.loadingStatus = LoadingStatus.Loading;
        this.changeDetector.markForCheck();
        this.fileLoader.getLocalVersionPath().subscribe((destination) => {
            this.src = `file://${destination}`;
            this.loadingStatus = LoadingStatus.Ready;
            this.changeDetector.markForCheck();
        });
    }

    private _updateImageDescription() {
        this.imageDescription = `Displaying image ${this.fileLoader.filename}`;
    }

}
