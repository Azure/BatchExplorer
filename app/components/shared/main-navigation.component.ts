import { Component } from "@angular/core";
import { Router } from "@angular/router";
import * as path from "path";

import {
    ContextMenu, ContextMenuItem, ContextMenuSeparator, ContextMenuService,
} from "app/components/base/context-menu";
import { AccountService, AdalService, ElectronShell } from "app/services";
import { Constants } from "app/utils";
import "./main-navigation.scss";

@Component({
    selector: "bl-app-nav",
    templateUrl: "main-navigation.html",
})
export class MainNavigationComponent {

    public selectedId: string;
    public selectedAccountAlias: string = "";
    public currentUserName: string = "";

    constructor(
        accountService: AccountService,
        private adalService: AdalService,
        private shell: ElectronShell,
        private contextMenuService: ContextMenuService,
        private router: Router) {

        accountService.currentAccountId.subscribe((accountId) => {
            if (accountId) {
                this.selectedId = accountId;
                this.selectedAccountAlias = accountService.getNameFromAccountId(accountId);
            } else {
                this.selectedAccountAlias = "No account selected!";
            }
        });

        adalService.currentUser.subscribe((user) => {
            if (user) {
                this.currentUserName = user.name;
            }
        });
    }

    public openSettingsContextMenu() {
        this.contextMenuService.openMenu(new ContextMenu([
            new ContextMenuItem({ label: "Settings", click: () => this._goToSettings() }),
            new ContextMenuItem({ label: "Third party notices", click: () => this._openThirdPartyNotices() }),
            new ContextMenuSeparator(),
            new ContextMenuItem({ label: "Logout", click: () => this._logout() }),
        ]));
    }

    private _goToSettings() {
        this.router.navigate(["/settings"]);
    }

    private _openThirdPartyNotices() {
        this.shell.openExternal(path.join(Constants.Client.resourcesFolder, "ThirdPartyNotices.txt"));
    }

    private _logout() {
        this.adalService.logout();
    }
}
