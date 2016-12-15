import { Component, HostBinding, OnDestroy, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { Subscription } from "rxjs";

import { SidebarManager } from "../../base/sidebar";

@Component({
    selector: "bex-file-home",
    templateUrl: "./file-home.html",
})
export class FileHomeComponent implements OnInit, OnDestroy {
    public id: string;

    private _paramsSubscriber: Subscription;

    @HostBinding("style.display") get display() {
        return "block";
    }

    @HostBinding("style.position") get position() {
        return "absolute";
    }

    constructor(
        private sidebarManager: SidebarManager,
        private activatedRoute: ActivatedRoute) {
    }

    public ngOnInit() {
        console.log("HERE I AM!");
        this._paramsSubscriber = this.activatedRoute.params.subscribe((params) => {
            // this.poolId = params["url"];
            console.log("from home Component");
            console.log(params);
        });
    }

    public ngOnDestroy() {
        this._paramsSubscriber.unsubscribe();
    }
}
