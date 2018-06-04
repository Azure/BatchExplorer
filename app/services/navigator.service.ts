import { Injectable, NgZone } from "@angular/core";
import { Router } from "@angular/router";
import { IpcService } from "@batch-flask/ui";

import { Constants } from "app/utils";
import { BatchLabsLink, BatchLabsLinkAction } from "common";
import * as decodeUriComponent from "decode-uri-component";
import { AccountService } from "./account.service";

export interface GotoOptions {
    /**
     * Which account should you navigate to
     * @default will use the current selected account
     */
    accountId?: string;
}

@Injectable()
export class NavigatorService {
    constructor(
        private accountService: AccountService,
        private router: Router,
        private zone: NgZone,
        private ipc: IpcService) {
    }

    public init() {
        this.ipc.on(Constants.rendererEvents.batchlabsLink, (event, link) => {
            this.zone.run(() => {
                this.openBatchLabsLink(link);
            });
        });
    }

    public get onLine(): boolean {
        return navigator.onLine;
    }
    /**
     * Handle opening a link with the ms-batchlabs:// protocol
     * @param value Full string starting with ms-batchlabs://
     */
    public openBatchLabsLink(link: string | BatchLabsLink) {
        const labsLink = new BatchLabsLink(link);
        switch (labsLink.action) {
            case BatchLabsLinkAction.route:
                const params = new URLSearchParams(labsLink.queryParams);
                const decodedParams = decodeUriComponent(params.toString());
                this.goto(`${labsLink.path}?${decodedParams}`, {
                    accountId: labsLink.accountId,
                });
        }
    }

    public goto(route: string, options: GotoOptions = {}) {
        if (options.accountId) {
            this.accountService.selectAccount(options.accountId);
        }
        this.router.navigateByUrl(route);
    }
}
