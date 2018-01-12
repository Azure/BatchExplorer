import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { ipcRenderer } from "electron";

import { Constants } from "app/utils";
import { BatchLabsLink, BatchLabsLinkAction } from "common";
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
    constructor(private accountService: AccountService, private router: Router) {
    }

    public init() {
        ipcRenderer.on(Constants.rendererEvents.batchlabsLink, (event, link) => {
            this.openBatchLabsLink(link);
        });
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
                this.goto(`${labsLink.path}?${params.toString()}`, {
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
