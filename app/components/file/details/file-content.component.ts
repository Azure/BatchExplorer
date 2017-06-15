import { Component, Input, OnChanges, OnInit, SimpleChanges } from "@angular/core";

import { FileService, StorageService } from "app/services";
import { FileLoader } from "app/services/file";
import "./file-content.scss";

enum FileType {
    log,
    image,
    code,
}

const fileTypes = {
    [FileType.log]: ["txt", "log"],
    [FileType.image]: ["png", "jpg", "gif"],
    [FileType.code]: ["json", "ts2", "js", "java", "cs", "cpp", "h", "hpp", "py", "xml"],
};

@Component({
    selector: "bl-file-content",
    templateUrl: "file-content.html",
})
export class FileContentComponent implements OnChanges, OnInit {
    public FileType = FileType;

    @Input() public jobId: string;

    @Input() public taskId: string;

    @Input() public poolId: string;

    @Input() public nodeId: string;

    @Input() public filename: string;

    @Input() public outputKind: string;

    public fileLoader: FileLoader = null;
    public fileType: FileType;

    constructor(
        private storageService: StorageService,
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

    public openAs(type: FileType) {
        this.fileType = type;
    }

    private setupFileLoad() {
        let obs: FileLoader;

        if (this.isJob) {
            obs = this.fileService.fileFromTask(this.jobId, this.taskId, this.filename);
        } else if (this.isPool) {
            obs = this.fileService.fileFromNode(this.poolId, this.nodeId, this.filename);
        } else if (this.isBlob) {
            obs = this.storageService.blobContent(this.jobId, this.taskId, this.outputKind, this.filename);
        } else {
            return;
        }
        this.fileLoader = obs;
    }

    private _findFileType() {
        if (!this.filename) {
            throw new Error(`Expect filename to be a valid string but was "${this.filename}"`)
        }
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
