import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnChanges, OnDestroy } from "@angular/core";
import { FileLoader } from "@batch-flask/ui/file/file-loader";
import { LoadingStatus } from "@batch-flask/ui/loading";
import { Subscription } from "rxjs";

import "./image-file-viewer.scss";

@Component({
    selector: "bl-image-file-viewer",
    templateUrl: "image-file-viewer.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ImageFileViewerComponent implements OnChanges, OnDestroy {

    @Input() public fileLoader: FileLoader;

    public src: string;
    public imageDescription: string;
    public loadingStatus = LoadingStatus.Loading;

    private _sub: Subscription;

    constructor(private changeDetector: ChangeDetectorRef) {}

    public ngOnChanges(changes) {
        this._loadImage();
        if (changes.fileLoader) {
            this._cleanup();
            this._updateImageDescription();
            this._sub = this.fileLoader.fileChanged.subscribe(() => {
                this._loadImage();
            });
        }
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
