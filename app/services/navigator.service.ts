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
        ipcRenderer.on(Constants.Client.rendererEvents.batchlabsLink, (event, link) => {
            this.openBatchLabsLink(link);
        });
    }

    /**
     * Handle opening a link with the ms-batchlabs:// protocol
     * @param value Full string starting with ms-batchlabs://
     */
    public openBatchLabsLink(link: string) {
        const data = new BatchLabsLink(link);
        this.perform(data.action, data.path, data.queryParams);

    }

    public perform(action: string, path: string, params: URLSearchParams) {
        switch (action) {
            case BatchLabsLinkAction.route:
                const newParams = new URLSearchParams(params);
                newParams.delete("accountId");
                this.goto(`${path}?${newParams.toString()}`, {
                    accountId: params.get("accountId"),
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
