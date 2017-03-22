import { Component, HostBinding, OnDestroy, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { Subscription } from "rxjs";

import { Constants } from "app/utils";
import { SidebarManager } from "../../base/sidebar";

@Component({
    selector: "bl-file-home",
    templateUrl: "file-home.html",
})
export class FileHomeComponent implements OnInit, OnDestroy {
    public url: string;

    public isPool: boolean;
    public isJob: boolean;

    public poolId: string;
    public nodeId: string;
    public jobId: string;
    public taskId: string;
    public filename: string;

    private _dataSub: Subscription;
    private _paramsSubscriber: Subscription;

    constructor(
        private sidebarManager: SidebarManager,
        private activatedRoute: ActivatedRoute) {
    }

    public ngOnInit() {
        this._dataSub = this.activatedRoute.data.subscribe((data) => {
            const type = data["type"];
            this.isJob = type === Constants.FileSourceTypes.Job;
            this.isPool = type === Constants.FileSourceTypes.Pool;
        });

        this._paramsSubscriber = this.activatedRoute.params.subscribe((params) => {
            this.jobId = params["jobId"];
            this.taskId = params["taskId"];
            this.poolId = params["poolId"];
            this.nodeId = params["nodeId"];
            this.filename = params["filename"];
        });
    }

    public ngOnDestroy() {
        this._dataSub.unsubscribe();
        this._paramsSubscriber.unsubscribe();
    }
}
