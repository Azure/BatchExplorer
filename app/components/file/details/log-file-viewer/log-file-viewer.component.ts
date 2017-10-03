import { AfterViewInit, Component, ElementRef, Input, OnChanges, OnDestroy } from "@angular/core";
import { Subscription } from "rxjs";

import { ScrollableComponent, ScrollableService } from "app/components/base/scrollable";
import { File, ServerError } from "app/models";
import { TaskService } from "app/services";
import { FileLoader } from "app/services/file";
import { Constants, log } from "app/utils";

import "./log-file-viewer.scss";

const maxSize = 10000000; // 10MB

@Component({
    selector: "bl-log-file-viewer",
    templateUrl: "log-file-viewer.html",
})
export class LogFileViewerComponent implements OnChanges, OnDestroy, AfterViewInit {
    @Input() public fileLoader: FileLoader;

    @Input() public tailable: boolean = false;

    public get tail() {
        return this.tailable;
    }

    public file: File;
    public fileTooLarge = false;
    public followingLog = false;
    public lastContentLength = 0;
    public lines = [];
    public loading = true;
    public scrollable: ScrollableComponent;
    public currentSubscription: Subscription;

    public nodeNotFound = false;
    public fileCleanupOperation = false;
    public fileContentFailure = false;

    private _refreshInterval;
    private _fileChangedSub: Subscription;

    constructor(
        private scrollableService: ScrollableService,
        taskService: TaskService,
        private element: ElementRef) {
    }

    public ngAfterViewInit() {
        setTimeout(() => {
            this.scrollable = this.scrollableService.getParentSrollable(this.element.nativeElement);
        });
    }

    public ngOnChanges(changes) {
        if (this._refreshInterval) {
            clearInterval(this._refreshInterval);
        }

        if (this.currentSubscription) {
            this.currentSubscription.unsubscribe();
        }

        if (this._fileChangedSub) {
            this._fileChangedSub.unsubscribe();
        }
        if (changes.fileLoader) {
            this._fileChangedSub = this.fileLoader.fileChanged.subscribe((file) => {
                this._processProperties(file);
            });
        }
        this.lines = [];
        this.loading = true;
        this.lastContentLength = 0;
        this.nodeNotFound = false;
        this.fileCleanupOperation = false;
        this.fileContentFailure = false;

        this._updateFileContent();
        this._setRefreshInterval();
    }

    public ngOnDestroy() {
        // clear the refresh when the user navigates away
        clearInterval(this._refreshInterval);
        this._fileChangedSub.unsubscribe();
    }

    public toggleFollowLog() {
        this.followingLog = !this.followingLog;
        if (this.followingLog) {
            this._scrollToBottom();
        }
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
        this.currentSubscription = this.fileLoader.getProperties(true).subscribe({
            next: (file: File) => {
                this.file = file;
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
        const options = {
            rangeStart: this.lastContentLength,
            rangeEnd: newContentLength,
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
        const contentLength = file.properties.contentLength;
        if (contentLength > maxSize) {
            this.loading = false;
            this.fileTooLarge = true;
            return;
        }

        if (contentLength === 0) {
            this.loading = false;
        } else if (contentLength !== this.lastContentLength) {
            this._loadUpTo(contentLength);
        }
    }

    private _processFileContent(result: any, newContentLength: number) {
        this.lastContentLength = newContentLength;
        const newLines = result.content.toString().split("\n");
        let first = "";
        if (newLines.length > 1) {
            first = newLines.shift();
        }

        if (this.lines.length === 0) {
            this.lines = [{ index: 0, text: first }];
        } else {
            this.lines[this.lines.length - 1].text += first;
        }
        const linesCount = this.lines.length;
        this.lines = this.lines.concat(newLines.map((text, index) => {
            return { index: linesCount + index, text };
        }));
        if (this.followingLog) {
            setTimeout(() => {
                this._scrollToBottom();
            });
        }

        this.loading = false;
        this.currentSubscription = null;
    }

    private _processError(e: ServerError) {
        this.currentSubscription = null;
        this.loading = false;

        clearInterval(this._refreshInterval);
        if (e.status === Constants.HttpCode.NotFound) {
            this.nodeNotFound = true;
            return;
        } else if (e.status === Constants.HttpCode.Conflict) {
            this.fileCleanupOperation = true;
            return;
        } else if (!e.status && e.message.startsWith("An incorrect number of bytes")) {
            // gets an undefined error code for binary files.
            this.fileContentFailure = true;
            return;
        }

        log.error(`[FileContent.component] Error is ${e.status}`, e);
    }

    private _scrollToBottom() {
        if (this.scrollable) {
            // TODO: make a scrollToBottom
            this.scrollable.scrollToBottom();
        }
    }
}
