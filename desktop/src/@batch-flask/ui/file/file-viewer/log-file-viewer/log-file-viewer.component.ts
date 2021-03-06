import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    OnDestroy,
    ViewChild,
} from "@angular/core";
import { LoadingStatus, ServerError } from "@batch-flask/core";
import { EditorComponent, EditorConfig } from "@batch-flask/ui/editor";
import { File } from "@batch-flask/ui/file/file.model";
import { log } from "@batch-flask/utils";
import { Subscription, interval } from "rxjs";
import { FileViewer } from "../file-viewer";

import "./log-file-viewer.scss";

@Component({
    selector: "bl-log-file-viewer",
    templateUrl: "log-file-viewer.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LogFileViewerComponent extends FileViewer implements OnDestroy {

    public get tail() {
        return this.tailable;
    }
    public static readonly MAX_FILE_SIZE = 10000000; // 10MB

    public tailable: boolean = false;

    @ViewChild("editor", { static: false }) public editor: EditorComponent;

    public followingLog = false;
    public lastContentLength = 0;
    public content = "";
    public loadingStatus = LoadingStatus.Loading;
    public currentSubscription: Subscription | null;

    public editorConfig: EditorConfig = {
        readOnly: true,
        minimap: {
            enabled: false,
        },
        scrollBeyondLastLine: false,
    };

    private _refreshInterval: Subscription;
    private _loadingNext = false;
    private _lastScroll: number = 0;

    constructor(
        changeDetector: ChangeDetectorRef) {
        super(changeDetector);
    }

    public ngOnDestroy() {
        super.ngOnDestroy();
        this._clearRefreshInterval();
    }

    public onFileLoaderChanges() {
        this._clearRefreshInterval();

        if (this.currentSubscription) {
            this.currentSubscription.unsubscribe();
        }

        this.loadingStatus = LoadingStatus.Loading;
        this.content = "";
        this.lastContentLength = 0;
        this._setRefreshInterval();
    }

    public onConfigChanges() {
        this.tailable = this.config && this.config.tailable || false;
        this._clearRefreshInterval();
        this._setRefreshInterval();
    }

    public onFileChanges(currentFile: File) {
        this._processProperties(currentFile);
    }

    public toggleFollowLog() {
        this.followingLog = !this.followingLog;
        this.changeDetector.markForCheck();
        if (this.followingLog) {
            this._scrollToBottom();
        }
    }

    public handleScroll(event) {
        if (this._lastScroll > event.target.scrollTop) {
            this.followingLog = false;
            this.changeDetector.markForCheck();
        }
        this._lastScroll = event.target.scrollTop;
    }
    private _clearRefreshInterval() {
        if (this._refreshInterval) {
            this._refreshInterval.unsubscribe();
        }
    }

    /**
     * Set the interval for refresh only if checking a task file.
     */
    private _setRefreshInterval() {
        if (!this.tail) {
            return;
        }

        this._refreshInterval = interval(5000).subscribe(() => {
            this._checkForFileChanges();
        });
    }

    private _checkForFileChanges() {
        if (!this.fileLoader) { return; }
        this.currentSubscription = this.fileLoader.refreshProperties().subscribe();
    }

    /**
     * Load the content of the file up to the given byte from the last number it loaded.
     * @param newContentLength Number of bytes to get the content to
     *
     * @example
     * this._loadUpTo(100); //=> Loads bytes 0-100
     * this._loadUpTo(300); //=> Loads bytes 100-300
     */
    private _loadUpTo(newContentLength: number) {
        this._loadingNext = true;
        const options = {
            rangeStart: this.lastContentLength,
            rangeEnd: newContentLength - 1,
        };

        this.currentSubscription = this.fileLoader.content(options).subscribe((result) => {
            this._processFileContent(result, newContentLength);
        }, (error) => {
            this._processError(error);
        });
    }

    /**
     * Process the properties of the file and check if we need to load more content.
     */
    private _processProperties(file: File) {
        if (!(file && file.properties)) {
            return;
        }
        this.file = file;

        const contentLength = file.properties.contentLength;
        if (contentLength === 0) {
            this.loadingStatus = LoadingStatus.Ready;
        } else if (contentLength !== this.lastContentLength && !this._loadingNext) {
            this._loadUpTo(contentLength);
        }
        this.changeDetector.markForCheck();
    }

    private _processFileContent(result: any, newContentLength: number) {
        this.lastContentLength = newContentLength;
        this.content += result.content;

        if (this.followingLog) {
            setTimeout(() => {
                this._scrollToBottom();
            });
        }

        this.loadingStatus = LoadingStatus.Ready;
        this._loadingNext = false;
        this.currentSubscription = null;
        this.changeDetector.markForCheck();
    }

    private _processError(e: ServerError) {
        this.currentSubscription = null;
        this.loadingStatus = LoadingStatus.Ready;

        this._clearRefreshInterval();

        log.error(`[LogFileViewer] Error is ${e.status}`, e);
        this.changeDetector.markForCheck();
    }

    private _scrollToBottom() {
        if (this.editor) {
            this.editor.scrollToEnd();
        }
    }
}
