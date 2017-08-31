import { Component } from "@angular/core";
import { Router } from "@angular/router";

import { AccountService, AdalService } from "app/services";

import { ContextMenu, ContextMenuItem, ContextMenuSeparator, ContextMenuService } from "app/components/base/context-menu";
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
            new ContextMenuSeparator(),
            new ContextMenuItem({ label: "Logout", click: () => this._logout() }),
        ]));
    }

    private _goToSettings() {
        this.router.navigate(["/settings"]);
    }

    private _logout() {
        this.adalService.logout();
    }
}
