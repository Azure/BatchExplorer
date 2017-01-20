import { Component, OnDestroy, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { autobind } from "core-decorators";
import { Subscription } from "rxjs";

import { FileService } from "app/services";

@Component({
    selector: "bex-file-details",
    templateUrl: "./file-details.html",
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
            let obj = this.parseRelativePath(this.url);

            if (obj.type === "job") {
                this.jobId = obj.containerName;
                this.taskId = obj.entityName;
                this.filename = obj.file;
                this.fileService.getFilePropertiesFromTask(this.jobId, this.taskId, this.filename)
                    .subscribe((details: any) => {
                        this.contentSize = details.data.properties.contentLength;
                    });
            } else {
                this.poolId = obj.containerName;
                this.nodeId = obj.entityName;
                this.filename = obj.file;
                this.fileService.getFilePropertiesFromComputeNode(this.poolId, this.nodeId, this.filename)
                    .subscribe((details: any) => {
                        this.contentSize = details.data.properties.contentLength;
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

    // TODO: Add unit tests!
    // TODO: Move to common utils
    private parseRelativePath(fileUrl: string): any {
        let parts: string[] = fileUrl.split("/");
        let obj: any = {};
        if (parts) {
            if (parts[3] === "jobs") {
                obj.type = "job";
            } else {
                obj.type = "pool";
            }
            obj.containerName = parts[4];
            obj.entityName = parts[6];
            obj.file = parts.slice(8, parts.length).join("/");
        }

        return obj;
    }
}
