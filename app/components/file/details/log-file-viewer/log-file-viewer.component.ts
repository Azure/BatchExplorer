import { AfterViewInit, Component, ElementRef, Input, OnChanges, OnDestroy, ViewChild } from "@angular/core";
import { HttpCode, ServerError } from "@batch-flask/core";
import { log } from "@batch-flask/utils";
import { Subscription } from "rxjs";

import { ScrollableComponent, ScrollableService } from "@batch-flask/ui/scrollable";
import { File } from "app/models";
import { TaskService } from "app/services";
import { FileLoader } from "app/services/file";

import { EditorComponent, EditorConfig } from "@batch-flask/ui/editor";
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

    @ViewChild("editor")
    public editor: EditorComponent;

    public file: File;
    public fileTooLarge = false;
    public followingLog = false;
    public lastContentLength = 0;
    public content = "";
    public loading = true;
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
            this.nodeNotFound = false;
            this.fileCleanupOperation = false;
            this.fileContentFailure = false;
            this.loading = true;
            this.content = "";
            this.lastContentLength = 0;
            this._fileChangedSub = this.fileLoader.fileChanged.subscribe((file) => {
                this._processProperties(file);
            });
        }

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

    public handleScroll(event) {
        if (this._lastScroll > event.target.scrollTop) {
            this.followingLog = false;
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
        if (contentLength > maxSize) {
            this.loading = false;
            this.fileTooLarge = true;
            return;
        }

        if (contentLength === 0) {
            this.loading = false;
        } else if (contentLength !== this.lastContentLength && !this._loadingNext) {
            this._loadUpTo(contentLength);
        }
    }

    private _processFileContent(result: any, newContentLength: number) {
        this.lastContentLength = newContentLength;
        this.content += result.content;

        if (this.followingLog) {
            setTimeout(() => {
                this._scrollToBottom();
            });
        }

        this.loading = false;
        this._loadingNext = false;
        this.currentSubscription = null;
    }

    private _processError(e: ServerError) {
        this.currentSubscription = null;
        this.loading = false;

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
    }

    private _scrollToBottom() {
        if (this.editor) {
            this.editor.scrollToEnd();
        }
    }
}
