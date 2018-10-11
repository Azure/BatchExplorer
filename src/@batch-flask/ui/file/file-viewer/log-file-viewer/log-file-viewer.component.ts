import {
    AfterViewInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ElementRef,
    OnDestroy,
    ViewChild,
} from "@angular/core";
import { HttpCode, LoadingStatus, ServerError } from "@batch-flask/core";
import { EditorComponent, EditorConfig } from "@batch-flask/ui/editor";
import { File } from "@batch-flask/ui/file/file.model";
import { ScrollableComponent, ScrollableService } from "@batch-flask/ui/scrollable";
import { log } from "@batch-flask/utils";
import { Subscription } from "rxjs";
import { FileViewer } from "../file-viewer";

import "./log-file-viewer.scss";

@Component({
    selector: "bl-log-file-viewer",
    templateUrl: "log-file-viewer.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LogFileViewerComponent extends FileViewer implements OnDestroy, AfterViewInit {
    public static readonly MAX_FILE_SIZE = 10000000; // 10MB

    public tailable: boolean = false;

    public get tail() {
        return this.tailable;
    }

    @ViewChild("editor") public editor: EditorComponent;

    public file: File;
    public fileTooLarge = false;
    public followingLog = false;
    public lastContentLength = 0;
    public content = "";
    public loadingStatus = LoadingStatus.Loading;
    public scrollable: ScrollableComponent;
    public currentSubscription: Subscription;

    public nodeNotFound = false;
    public fileCleanupOperation = false;
    public fileContentFailure = false;

    public editorConfig: EditorConfig = {
        readOnly: true,
        minimap: {
            enabled: false,
        },
        scrollBeyondLastLine: false,
    };

    private _refreshInterval;
    private _loadingNext = false;
    private _fileChangedSub: Subscription;
    private _lastScroll: number = 0;

    constructor(
        changeDetector: ChangeDetectorRef,
        private scrollableService: ScrollableService,
        private element: ElementRef) {
        super(changeDetector);
    }

    public ngAfterViewInit() {
        setTimeout(() => {
            this.scrollable = this.scrollableService.getParentSrollable(this.element.nativeElement);
        });
    }

    public onFileLoaderChanges() {
        if (this._refreshInterval) {
            clearInterval(this._refreshInterval);
        }

        if (this.currentSubscription) {
            this.currentSubscription.unsubscribe();
        }

        if (this._fileChangedSub) {
            this._fileChangedSub.unsubscribe();
        }
        this.nodeNotFound = false;
        this.fileCleanupOperation = false;
        this.fileContentFailure = false;
        this.loadingStatus = LoadingStatus.Loading;
        this.content = "";
        this.lastContentLength = 0;
        this._fileChangedSub = this.fileLoader.fileChanged.subscribe((file) => {
            this._processProperties(file);
        });

        this._updateFileContent();
        this._setRefreshInterval();
    }

    public onConfigChanges() {
        this.tailable = this.config && this.config.tailable;
        if (this._refreshInterval) {
            clearInterval(this._refreshInterval);
        }
        this._setRefreshInterval();
    }

    public ngOnDestroy() {
        // clear the refresh when the user navigates away
        clearInterval(this._refreshInterval);
        this._fileChangedSub.unsubscribe();
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

    /**
     * Set the interval for refresh only if checking a task file.
     */
    private _setRefreshInterval() {
        if (!this.tail) {
            return;
        }

        this._refreshInterval = setInterval(() => {
            this._updateFileContent();
        }, 5000);
    }

    private _updateFileContent() {
        this.fileTooLarge = false;
        this.changeDetector.markForCheck();
        this.currentSubscription = this.fileLoader.getProperties(true).subscribe({
            next: (file: File) => {
                this._processProperties(file);
            },
            error: (e) => {
                this._processError(e);
            },
        });
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

        clearInterval(this._refreshInterval);
        if (e.status === HttpCode.NotFound) {
            this.nodeNotFound = true;
            return;
        } else if (e.status === HttpCode.Conflict) {
            this.fileCleanupOperation = true;
            return;
        } else if (!e.status && e.message && e.message.startsWith("An incorrect number of bytes")) {
            // gets an undefined error code for binary files.
            this.fileContentFailure = true;
            return;
        }

        log.error(`[FileContent.component] Error is ${e.status}`, e);
        this.changeDetector.markForCheck();
    }

    private _scrollToBottom() {
        if (this.editor) {
            this.editor.scrollToEnd();
        }
    }
}
