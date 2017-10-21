import { Component, NgZone, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { AppUpdater } from "electron-updater";
import * as path from "path";

import {
    ContextMenu, ContextMenuItem, ContextMenuSeparator, ContextMenuService,
} from "app/components/base/context-menu";
import { NotificationService } from "app/components/base/notifications";
import { AccountService, AdalService, ElectronRemote, ElectronShell } from "app/services";
import { Constants, OS } from "app/utils";
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
    private _showNotification = false;

    constructor(
        accountService: AccountService,
        private adalService: AdalService,
        private shell: ElectronShell,
        private remote: ElectronRemote,
        private contextMenuService: ContextMenuService,
        private zone: NgZone,
        private notificationService: NotificationService,
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

        this._autoUpdater.on("update-available", (info) => {
            this.update = info;

            this._notify("Update available", `Update ${info.version} is now available.`, {
                action: () => this._update(),
            });
        });

        this._autoUpdater.on("update-not-available", (info) => {
            this.update = null;
            this._notify("There are no updates currently available.", `You  have the latest BatchLabs version.`);
        });
    }

    public ngOnInit() {
        this._checkForUpdates(false);
    }

    public get hasNewUpdate(): boolean {
        return Boolean(this.update);
    }

    public openSettingsContextMenu() {
        const items = [
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
        } else {
            items.unshift(new ContextMenuItem({ label: "Check for updates", click: () => this._checkForUpdates() }));
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

    private _checkForUpdates(showNotification = true) {
        this._showNotification = showNotification;
        this.remote.getBatchLabsApp().checkForUpdates();
    }

    private _update() {
        if (OS.isWindows()) {
            this._autoUpdater.quitAndInstall();
        } else {
            this.shell.openExternal("https://azure.github.io/BatchLabs/");
        }
    }

    private _notify(title: string, description: string, options: any = {}) {
        this.zone.run((() => {
            if (this._showNotification) {
                this.notificationService.info(title, description, options);
            }
            this._showNotification = false;
        }));
    }
}
