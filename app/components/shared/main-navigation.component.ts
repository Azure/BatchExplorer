import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { AppUpdater } from "electron-updater";
import * as path from "path";

import {
    ContextMenu, ContextMenuItem, ContextMenuSeparator, ContextMenuService,
} from "app/components/base/context-menu";
import { AccountService, AdalService, ElectronRemote, ElectronShell } from "app/services";
import { Constants } from "app/utils";
import "./main-navigation.scss";

@Component({
    selector: "bl-app-nav",
    templateUrl: "main-navigation.html",
})
export class MainNavigationComponent implements OnInit {

    public selectedId: string;
    public selectedAccountAlias: string = "";
    public currentUserName: string = "";
    public update: any;
    private _autoUpdater: AppUpdater;

    constructor(
        accountService: AccountService,
        private adalService: AdalService,
        private shell: ElectronShell,
        private remote: ElectronRemote,
        private contextMenuService: ContextMenuService,
        private router: Router) {
        this._autoUpdater = remote.getBatchLabsApp().autoUpdater;

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
        this._autoUpdater.configOnDisk.value.then((data) => console.log("Config", data));
        console.log("this.", this._autoUpdater.listenerCount);
        this._autoUpdater.on("update-available", (info) => {
            console.log("update available", info);
        });
        this._autoUpdater.on("update-not-available", (info) => {
            console.log("update NOT available", info);
        });
        this._autoUpdater.on("download-progress", (info) => {
            console.log("update progress", info);
        });
        this._autoUpdater.on("update-downloaded", (info) => {
            console.log("update downloaded", info);
        });
    }

    public ngOnInit() {
        this._checkForUpdates();
    }

    public get hasNewUpdate(): boolean {
        return Boolean(this.update);
    }

    public openSettingsContextMenu() {
        const items = [
            new ContextMenuItem({ label: "Check for updates", click: () => this._checkForUpdates() }),
            new ContextMenuSeparator(),
            new ContextMenuItem({ label: "Settings", click: () => this._goToSettings() }),
            new ContextMenuItem({ label: "Third party notices", click: () => this._openThirdPartyNotices() }),
            new ContextMenuSeparator(),
            new ContextMenuItem({ label: "Logout", click: () => this._logout() }),
        ];

        if (this.update) {
            items.unshift(new ContextMenuItem({
                label: `Update to version ${this.update.version}`,
                click: () => this._update(),
            }));
        }
        this.contextMenuService.openMenu(new ContextMenu(items));
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

    private async _checkForUpdates() {
        const data = await this.remote.getBatchLabsApp().checkForUpdates();
        console.log("There is an update with", data);
        if (!data) { return; }
        this.update = data.versionInfo;
    }

    private _update() {
        console.log("Will update...");
    }
}
