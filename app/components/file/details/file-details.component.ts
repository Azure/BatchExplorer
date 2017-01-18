import { Component, OnDestroy, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { autobind } from "core-decorators";
import { Subscription } from "rxjs";

import { File } from "app/models";
import { FileService } from "app/services";
import { RxEntityProxy } from "app/services/core";

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

    // test stuff
    public nodeId: string;
    public poolId: string;

    private _paramsSubscribers: Subscription[] = [];

    constructor(private route: ActivatedRoute, private fileService: FileService) {
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

        // this._paramsSubscribers.push(this.route.parent.params.subscribe((params) => {

        // }));

    }

    public update() {
        // if (this.nodeId && this.poolId) {
        //     this.data.params = { id: this.nodeId, poolId: this.poolId };
        //     this.data.fetch();
        // }
    }

    public ngOnDestroy() {
        this._paramsSubscribers.forEach(x => x.unsubscribe());
    }

    @autobind()
    public refresh() {
        // return this.data.refresh();
        console.log("refresh file ...");
    }

    public downloadFile() {
        console.log("download file ...");
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
