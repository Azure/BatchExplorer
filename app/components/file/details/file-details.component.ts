import { Component, OnDestroy, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { autobind } from "core-decorators";
import { remote } from "electron";
import { writeFile } from "fs";
import { Subscription } from "rxjs";

import { FileService } from "app/services";
import { Constants, FileUrlUtils } from "app/utils";

@Component({
    selector: "bl-file-details",
    templateUrl: "file-details.html",
})
export class FileDetailsComponent implements OnInit, OnDestroy {
    public static breadcrumb({filename}) {
        return { name: filename, label: "File", invertName: true };
    }

    public jobId: string;
    public taskId: string;
    public nodeId: string;
    public poolId: string;
    public url: string;
    public filename: string;
    public contentSize: number;
    public downloadEnabled: boolean;

    private _sourceType: string;
    private _paramsSubscribers: Subscription[] = [];

    constructor(private route: ActivatedRoute, private fileService: FileService) {
        this.downloadEnabled = false;
    }

    public ngOnInit() {
        this._paramsSubscribers.push(this.route.data.subscribe((data) => {
            this._sourceType = data["type"];
        }));

        this._paramsSubscribers.push(this.route.params.subscribe((params) => {
            this.jobId = params["jobId"];
            this.taskId = params["taskId"];
            this.poolId = params["poolId"];
            this.nodeId = params["nodeId"];
            this.filename = params["filename"];
            if (this._sourceType === Constants.FileSourceTypes.Job) {
                let propertiesProxy = this.fileService.getFilePropertiesFromTask(
                    this.jobId, this.taskId, this.filename);

                propertiesProxy.fetch().subscribe((details: any) => {
                    this.url = decodeURIComponent(details.url);
                    this.contentSize = details.properties.contentLength;
                });
            } else {
                let propertiesProxy = this.fileService.getFilePropertiesFromComputeNode(
                    this.poolId, this.nodeId, this.filename);

                propertiesProxy.fetch().subscribe((details: any) => {
                    this.url = decodeURIComponent(details.url);
                    this.contentSize = details.properties.contentLength;
                });

                this.downloadEnabled = true;
            }
        }));

    }

    public update() {
        return;
    }

    public ngOnDestroy() {
        this._paramsSubscribers.forEach(x => x.unsubscribe());
    }

    @autobind()
    public refresh() {
        return;
    }

    public downloadFile() {
        const dialog = remote.dialog;
        const localPath = dialog.showSaveDialog({
            buttonLabel: "Download",
            // Set default filename of file to download
            defaultPath: FileUrlUtils.getFileName(this.url),
        });

        if (localPath) {
            this._saveFile(localPath);
        }
    }

    private _saveFile(fileName) {
        if (fileName === undefined) {
            return;
        }

        const obj = FileUrlUtils.parseRelativePath(this.url);
        if (obj.type === Constants.FileSourceTypes.Job) {
            this.fileService.getFileContentFromTask(
                this.jobId, this.taskId, this.filename).subscribe((data) => {
                    writeFile(fileName, data.content);
                });
        } else {
            this.fileService.getFileContentFromComputeNode(
                this.poolId, this.nodeId, this.filename).subscribe((data) => {
                    writeFile(fileName, data.content);
                });
        }

    }
}
