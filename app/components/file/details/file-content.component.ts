import { AfterViewInit, Component, ElementRef, Input, OnChanges } from "@angular/core";
import { Observable, Subscription } from "rxjs";

import { ScrollableComponent, ScrollableService } from "app/components/base/scrollable";
import { File, ServerError } from "app/models";
import { FileService } from "app/services";
import { Constants, log } from "app/utils";

@Component({
    selector: "bex-file-content",
    templateUrl: "file-content.html",
})
export class FileContentComponent implements OnChanges, AfterViewInit {
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
    public inter;

    public followingLog = false;

    public lastContentLength = 0;
    public notFound = false;

    public lines = [];
    public loading = true;

    public scrollable: ScrollableComponent;
    public currentSubscription: Subscription;

    constructor(
        private scrollableService: ScrollableService,
        private fileService: FileService,
        private element: ElementRef) {

    }

    public ngAfterViewInit() {
        this.scrollable = this.scrollableService.getParentSrollable(this.element.nativeElement);
    }

    public ngOnChanges(inputs) {
        if (this.inter) {
            clearInterval(this.inter);
        }
        if (this.currentSubscription) {
            this.currentSubscription.unsubscribe();
        }
        this.notFound = false;
        this.lines = [];
        this.loading = true;
        this.lastContentLength = 0;
        this.inter = setInterval(() => {
            this._updateFileContent();
        }, 5000);
    }

    public toggleFollowLog() {
        this.followingLog = !this.followingLog;
        if (this.followingLog) {
            this._scrollToBottom();
        }
    }

    private _updateFileContent() {
        let data;
        if (this.jobId && this.taskId) {
            data = this.fileService.getFilePropertiesFromTask(
                this.jobId, this.taskId, this.filename);
        } else if (this.poolId && this.nodeId) {
            data = this.fileService.getFilePropertiesFromComputeNode(
                this.poolId, this.nodeId, this.filename);
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
        const ocpRange = `bytes=${this.lastContentLength}-${newContentLength}`;
        let obs: Observable<any>;

        if (this.jobId && this.taskId) {
            obs = this.fileService.getFileContentFromTask(this.jobId, this.taskId, this.filename, {
                fileGetFromTaskOptions: { ocpRange },
            });
        } else if (this.poolId && this.nodeId) {
            obs = this.fileService.getFileContentFromComputeNode(this.poolId, this.nodeId, this.filename, {
                fileGetFromComputeNodeOptions: { ocpRange },
            });
        } else {
            return;
        }

        this.currentSubscription = obs.subscribe((result) => {
            this._processFileContent(result, newContentLength);
        }, (e) => {
            this._processError(e);
        });
    }

    /**
     * Process the properties of the file and check if we need to load more content.
     */
    private _processProperties(file: File) {
        if (file && file.properties) {
            const newContentLength = file.properties.contentLength;
            if (newContentLength !== this.lastContentLength) {
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

        clearInterval(this.inter);
        if (e.status === Constants.HttpCode.NotFound) {
            this.notFound = true;
            return;
        } else if (e.status === Constants.HttpCode.Conflict) {
            this.notFound = true;
            return;
        }

        log.error(`[FileContent.component] Error is ${e.status}`, e);
    }

    private _scrollToBottom() {
        if (this.scrollable) {
            this.scrollable.scrollToBottom(); // TODO make a scrollToBottom
        }
    }
}
