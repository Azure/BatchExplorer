import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy } from "@angular/core";
import { LoadingStatus } from "@batch-flask/ui/loading";
import { Subscription } from "rxjs";
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

    private _sub: Subscription;

    constructor(changeDetector: ChangeDetectorRef) {
        super(changeDetector);
    }

    public onFileLoaderChanges() {
        this._cleanup();
        this._loadImage();
        this._updateImageDescription();
        this._sub = this.fileLoader.fileChanged.subscribe(() => {
            this._loadImage();
        });
    }

    public ngOnDestroy() {
        this._cleanup();
    }

    private _loadImage() {
        this.loadingStatus = LoadingStatus.Loading;
        this.changeDetector.markForCheck();
        this.fileLoader.cache().subscribe((destination) => {
            this.src = `file://${destination}`;
            this.loadingStatus = LoadingStatus.Ready;
            this.changeDetector.markForCheck();
        });
    }

    private _updateImageDescription() {
        this.imageDescription = `Displaying image ${this.fileLoader.filename}`;
    }

    private _cleanup() {
        if (this._sub) {
            this._sub.unsubscribe();
        }
    }
}
