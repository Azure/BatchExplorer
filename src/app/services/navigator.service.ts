import { Injectable, OnDestroy } from "@angular/core";
import { Router } from "@angular/router";
import { IpcService } from "@batch-flask/electron";
import { BatchExplorerLink, BatchExplorerLinkAction, Constants } from "common";
import * as decodeUriComponent from "decode-uri-component";
import { Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { URLSearchParams } from "url";
import { BatchAccountService } from "./batch-account";

export interface GotoOptions {
    /**
     * Which account should you navigate to
     * @default will use the current selected account
     */
    accountId?: string;
}

@Injectable({ providedIn: "root" })
export class NavigatorService implements OnDestroy {
    private _destroy = new Subject();

    constructor(
        private accountService: BatchAccountService,
        private router: Router,
        private ipc: IpcService) {
    }

    public ngOnDestroy() {
        this._destroy.next();
        this._destroy.unsubscribe();
    }

    public init() {
        this.ipc.on(Constants.rendererEvents.batchExplorerLink).pipe(
            takeUntil(this._destroy),
        ).subscribe(([_, link]) => {
            setTimeout(() => {
                this.openBatchExplorerLink(link);
            });
        });
        this.ipc.on(Constants.rendererEvents.navigateTo).pipe(
            takeUntil(this._destroy),
        ).subscribe(([_, link]) => {
            setTimeout(() => {
                this.goto(link);
            });
        });
    }

    public get onLine(): boolean {
        return navigator.onLine;
    }

    /**
     * Handle opening a link with the ms-batch-explorer:// protocol
     * @param value Full string starting with ms-batch-explorer://
     */
    public openBatchExplorerLink(link: string | BatchExplorerLink) {
        const labsLink = new BatchExplorerLink(link);
        switch (labsLink.action) {
            case BatchExplorerLinkAction.route:
                const params = new URLSearchParams(labsLink.queryParams);
                const decodedParams = decodeUriComponent(params.toString());
                this.goto(`${labsLink.path}?${decodedParams}`, {
                    accountId: labsLink.accountId,
                });
        }
    }

    public goto(route: string, options: GotoOptions = {}): Promise<boolean> {
        if (options.accountId) {
            this.accountService.selectAccount(options.accountId);
        }
        return this.router.navigateByUrl(route);
    }
}
