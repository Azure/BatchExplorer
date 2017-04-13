import { AfterViewInit, Component, ElementRef, Input, OnChanges, OnDestroy } from "@angular/core";
import { Observable, Subscription } from "rxjs";

import { ScrollableComponent, ScrollableService } from "app/components/base/scrollable";
import { File, ServerError } from "app/models";
import { FileService, StorageService, TaskService } from "app/services";
import { Constants, log } from "app/utils";

@Component({
    selector: "bl-file-content",
    templateUrl: "file-content.html",
})
export class FileContentComponent implements OnChanges, OnDestroy, AfterViewInit {
    @Input()
    public jobId: string;

    @Input()
    public taskId: string;

    @Input()
    public poolId: string;

    @Input()
    public nodeId: string;

    @Input()
    public filename: string;

    @Input()
    public outputKind: string;

    public followingLog = false;
    public lastContentLength = 0;
    public lines = [];
    public loading = true;
    public scrollable: ScrollableComponent;
    public currentSubscription: Subscription;

    public nodeNotFound = false;
    public fileContentFailure = false;

    private _refreshInterval;

    constructor(
        private storageService: StorageService,
        private scrollableService: ScrollableService,
        private taskService: TaskService,
        private fileService: FileService,
        private element: ElementRef) {
    }

    public ngAfterViewInit() {
        this.scrollable = this.scrollableService.getParentSrollable(this.element.nativeElement);
    }

    public ngOnChanges(inputs) {
        if (this._refreshInterval) {
            clearInterval(this._refreshInterval);
        }

        if (this.currentSubscription) {
            this.currentSubscription.unsubscribe();
        }

        this.lines = [];
        this.loading = true;
        this.lastContentLength = 0;
        this.nodeNotFound = false;
        this.fileContentFailure = false;

        this._updateFileContent();
        this._setRefreshInterval();
    }

    public ngOnDestroy() {
        // clear the refresh when the user navigates away
        clearInterval(this._refreshInterval);
    }

    public toggleFollowLog() {
        this.followingLog = !this.followingLog;
        if (this.followingLog) {
            this._scrollToBottom();
        }
    }

    public get isJob() {
        return this.jobId && this.taskId && !this.outputKind;
    }

    public get isPool() {
        return this.poolId && this.nodeId;
    }

    public get isBlob() {
        return this.jobId && this.taskId && this.outputKind;
    }

    /**
     * Set the interval for refresh only if checking a task file.
     */
    private _setRefreshInterval() {
        if (this.poolId || this.nodeId) {
            return;
        }

        this._refreshInterval = setInterval(() => {
            this._updateFileContent();
        }, 5000);
    }

    private _updateFileContent() {
        let data;
        if (this.isJob) {
            data = this.fileService.getFilePropertiesFromTask(this.jobId, this.taskId, this.filename);
        } else if (this.isPool) {
            data = this.fileService.getFilePropertiesFromComputeNode(this.poolId, this.nodeId, this.filename);
        } else if (this.isBlob) {
            data = this.storageService.getBlobProperties(this.jobId, this.taskId, this.outputKind, this.filename);
        } else {
            return;
        }

        this.currentSubscription = data.fetch().subscribe({
            next: (result: any) => {
                this._processProperties(result);
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
        let obs: Observable<any>;
        const ocpRange = `bytes=${this.lastContentLength}-${newContentLength}`;

        if (this.isJob) {
            obs = this.fileService.getFileContentFromTask(this.jobId, this.taskId, this.filename, {
                fileGetFromTaskOptions: { ocpRange },
            });
        } else if (this.isPool) {
            obs = this.fileService.getFileContentFromComputeNode(this.poolId, this.nodeId, this.filename, {
                fileGetFromComputeNodeOptions: { ocpRange },
            });
        } else if (this.isBlob) {
            const blobName = `${this.taskId}/${this.outputKind}/${this.filename}`;
            obs = this.storageService.getBlobContent(this.jobId, blobName, {
                rangeStart: this.lastContentLength,
                rangeEnd: newContentLength,
            });
        } else {
            return;
        }

        this.currentSubscription = obs.subscribe((result) => {
            this._processFileContent(result, newContentLength);
        }, (error) => {
            this._processError(error);
        });
    }

    /**
     * Process the properties of the file and check if we need to load more content.
     */
    private _processProperties(file: File) {
        if (file && file.properties) {
            const newContentLength = file.properties.contentLength;
            if (newContentLength === 0) {
                this.loading = false;
            } else if (newContentLength !== this.lastContentLength) {
                this._loadUpTo(newContentLength);
            }
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
            this.lines = [first];
        } else {
            this.lines[this.lines.length - 1] += first;
        }

        this.lines = this.lines.concat(newLines);
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
            this.nodeNotFound = true;
            return;
        } else if (!e.status && e.body.message.startsWith("An incorrect number of bytes")) {
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
