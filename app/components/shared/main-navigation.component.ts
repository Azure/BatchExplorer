import { Component, NgZone, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { AppUpdater } from "electron-updater";
import * as path from "path";

import {
    ContextMenu, ContextMenuItem, ContextMenuSeparator, ContextMenuService,
} from "app/components/base/context-menu";
import { NotificationService } from "app/components/base/notifications";
import { AccountService, AdalService, ElectronRemote, ElectronShell, FileSystemService } from "app/services";
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
    public showSecondary = false;

    private _autoUpdater: AppUpdater;
    private _showNotification = false;
    private _jobCategoryDefaultOrder = true;

    constructor(
        accountService: AccountService,
        private adalService: AdalService,
        private shell: ElectronShell,
        private remote: ElectronRemote,
        private contextMenuService: ContextMenuService,
        private zone: NgZone,
        private notificationService: NotificationService,
        private fs: FileSystemService,
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
            new ContextMenuItem({ label: "View logs", click: () => this._openLogFolder() }),
            new ContextMenuItem({ label: "Report a bug or feature request", click: () => this._openGithubIssues() }),
            new ContextMenuItem({ label: "About", click: () => this._showAboutPage() }),
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

    public toggleJobCategory() {
        this.showSecondary = !this.showSecondary;
    }

    public setJobCategoryMenuItem(id: string) {
        if (this._jobCategoryDefaultOrder !== (id === "job")) {
            this._jobCategoryDefaultOrder = !this._jobCategoryDefaultOrder;
        }
    }

    public get menuSelection() {
        const jobSelection = {
            id: "job",
            label: "Jobs",
            icon: "fa-tasks",
            routerLink: "/jobs",
        };
        const jobScheduleSelection = {
            id: "jobschedule",
            label: "Job schedules",
            icon: "fa-calendar",
            routerLink: "/jobschedule",
        };
        return this._jobCategoryDefaultOrder ?
            { primary: jobSelection, secondary: jobScheduleSelection } :
            { primary: jobScheduleSelection, secondary: jobSelection };
    }

    private _goToSettings() {
        this.router.navigate(["/settings"]);
    }

    private _openThirdPartyNotices() {
        this.shell.openItem(path.join(Constants.Client.resourcesFolder, "ThirdPartyNotices.txt"));
    }

    private _openLogFolder() {
        this.shell.openItem(path.join(this.fs.commonFolders.userData, "logs"));
    }

    private _openGithubIssues() {
        this.shell.openExternal("https://github.com/Azure/BatchLabs/issues");
    }

    private _showAboutPage() {
        this.remote.dialog.showMessageBox({
            type: "info",
            title: "BatchLabs",
            message: [
                `Version: ${Constants.Client.version}`,
                `Batch labs is licensed under MIT`,
                `Some icons are under Creative Commons Attribution-ShareAlike 3.0 Unported`,
            ].join("\n"),
        });
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
