import { Component, Input, OnChanges, OnInit, SimpleChanges } from "@angular/core";

import { FileService, StorageService, TaskService } from "app/services";
import { FileLoader } from "app/services/file";

enum FileType {
    Log,
    Image,
    Code,
}

const fileTypes = {
    [FileType.Log]: ["txt", "log"],
    [FileType.Image]: ["png", "jpg", "gif"],
    [FileType.Code]: ["json", "ts", "js", "java", "cs", "cpp", "h", "hpp", "py", "xml"],
};

@Component({
    selector: "bl-file-content",
    templateUrl: "file-content.html",
})
export class FileContentComponent implements OnChanges, OnInit {
    public FileType = FileType;

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

    public lastContentLength = 0;
    public lines = [];
    public loading = true;

    public nodeNotFound = false;
    public fileCleanupOperation = false;
    public fileContentFailure = false;

    public fileLoader: FileLoader = null;
    public fileType: FileType;

    constructor(
        private storageService: StorageService,
        taskService: TaskService,
        private fileService: FileService) {
    }

    public ngOnInit() {
        this.setupFileLoad();
    }

    public ngOnChanges(changes: SimpleChanges) {
        if (changes.filename) {
            this._findFileType();
        }

        this.setupFileLoad();
        this.nodeNotFound = false;
        this.fileCleanupOperation = false;
        this.fileContentFailure = false;
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

    private setupFileLoad() {
        let obs: FileLoader;

        if (this.isJob) {
            obs = this.fileService.fileFromTask(this.jobId, this.taskId, this.filename);
        } else if (this.isPool) {
            obs = this.fileService.fileFromNode(this.poolId, this.nodeId, this.filename);
        } else if (this.isBlob) {
            const blobName = `${this.taskId}/${this.outputKind}/${this.filename}`;
            obs = this.storageService.blobContent(this.jobId, blobName);
        } else {
            return;
        }
        this.fileLoader = obs;
    }

    private _findFileType() {
        const filename = this.filename.toLowerCase();
        for (let type of Object.keys(fileTypes)) {
            const extensions = fileTypes[type];
            for (let ext of extensions) {
                if (filename.endsWith(`.${ext}`)) {
                    this.fileType = type as any;
                    return;
                }
            }
        }
        this.fileType = null;
    }
}
