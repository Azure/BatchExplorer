import { Component, Input, OnChanges, OnDestroy } from "@angular/core";
import { Subscription } from "rxjs";

import { LoadingStatus } from "@batch-flask/ui/loading";
import { FileLoader } from "app/services/file";
import "./image-file-viewer.scss";

@Component({
    selector: "bl-image-file-viewer",
    templateUrl: "image-file-viewer.html",
})
export class ImageFileViewerComponent implements OnChanges, OnDestroy {
    @Input() public fileLoader: FileLoader;

    public src: string;
    public loadingStatus = LoadingStatus.Loading;

    private _sub: Subscription;

    public ngOnChanges(changes) {
        this._loadImage();
        if (changes.fileLoader) {
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
        this.fileLoader.cache().subscribe((destination) => {
            this.src = `file://${destination}`;
            this.loadingStatus = LoadingStatus.Ready;
        });
    }

    private _cleanup() {
        if (this._sub) {
            this._sub.unsubscribe();
        }
    }
}
