import { Component, OnDestroy, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { autobind } from "core-decorators";
import { Subscription } from "rxjs";

import { FileService } from "app/services";
import { Constants, FileUrlUtils } from "app/utils";

@Component({
    selector: "bex-file-details",
    templateUrl: "file-details.html",
})
export class FileDetailsComponent implements OnInit, OnDestroy {
    public jobId: string;
    public taskId: string;
    public url: string;
    public filename: string;
    public contentSize: number;
    public downloadEnabled: boolean;

    // test stuff
    public nodeId: string;
    public poolId: string;

    private _paramsSubscribers: Subscription[] = [];

    constructor(private route: ActivatedRoute, private fileService: FileService) {
        // Todo: Enable download file
        this.downloadEnabled = false;
    }

    public ngOnInit() {
        this._paramsSubscribers.push(this.route.params.subscribe((params) => {
            this.url = params["url"];
            let obj = FileUrlUtils.parseRelativePath(this.url);

            if (obj.type === Constants.FileSourceTypes.Job) {
                this.jobId = obj.containerName;
                this.taskId = obj.entityName;
                this.filename = obj.file;
                let propertiesProxy = this.fileService.getFilePropertiesFromTask(
                    this.jobId, this.taskId, this.filename);

                propertiesProxy.fetch().subscribe((details: any) => {
                    this.contentSize = details.properties.contentLength;
                });
            } else {
                this.poolId = obj.containerName;
                this.nodeId = obj.entityName;
                this.filename = obj.file;
                let propertiesProxy = this.fileService.getFilePropertiesFromComputeNode(
                    this.poolId, this.nodeId, this.filename);

                propertiesProxy.fetch().subscribe((details: any) => {
                    this.contentSize = details.properties.contentLength;
                });
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
        // TODO: Download file
        return;
    }
}
