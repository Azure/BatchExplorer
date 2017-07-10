import { Component, OnDestroy, OnInit } from "@angular/core";
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
    public isBlob: boolean;

    public outputKind: string;
    public filename: string;

    private _dataSub: Subscription;
    private _paramsSubscriber: Subscription;

    constructor(
        sidebarManager: SidebarManager,
        private activatedRoute: ActivatedRoute) {
    }

    public ngOnInit() {
        this._dataSub = this.activatedRoute.data.subscribe((data) => {
            const type = data["type"];
            this.isBlob = type === Constants.FileSourceTypes.Blob;
        });

        this._paramsSubscriber = this.activatedRoute.params.subscribe((params) => {
            this.outputKind = params["outputKind"];
            this.filename = params["filename"];
        });
    }

    public ngOnDestroy() {
        this._dataSub.unsubscribe();
        this._paramsSubscriber.unsubscribe();
    }
}
