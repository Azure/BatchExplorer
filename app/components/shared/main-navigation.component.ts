import { ChangeDetectorRef, Component, NgZone, OnDestroy, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { AutoUpdateService, ElectronRemote, ElectronShell, UpdateStatus } from "@batch-flask/ui";
import { OS } from "@batch-flask/utils";
import { AppUpdater } from "electron-updater";
import * as path from "path";

import {
    ContextMenu, ContextMenuItem, ContextMenuSeparator, ContextMenuService,
} from "@batch-flask/ui/context-menu";
import { NotificationService } from "@batch-flask/ui/notifications";
import {
    AccountService, AdalService, BatchLabsService, FileSystemService,
} from "app/services";

import { Subscription } from "rxjs";
import "./main-navigation.scss";

@Component({
    selector: "bl-app-nav",
    templateUrl: "main-navigation.html",
})
export class MainNavigationComponent implements OnInit, OnDestroy {
    public UpdateStatus = UpdateStatus;

    public selectedId: string;
    public selectedAccountAlias: string = "";
    public currentUserName: string = "";
    public updateStatus: UpdateStatus;

    private _updateSub: Subscription;

    constructor(
        accountService: AccountService,
        adalService: AdalService,
        private changeDetector: ChangeDetectorRef,
        private autoUpdateService: AutoUpdateService,
        private batchLabs: BatchLabsService,
        private shell: ElectronShell,
        private remote: ElectronRemote,
        private contextMenuService: ContextMenuService,
        private zone: NgZone,
        private notificationService: NotificationService,
        private fs: FileSystemService,
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

        this._updateSub = this.autoUpdateService.status.subscribe((status) => {
            this.updateStatus = status;
            console.log("Status?", status);
            this.changeDetector.markForCheck();
        });
    }

    public ngOnInit() {
        this._checkForUpdates(false);
    }

    public ngOnDestroy() {
        this._updateSub.unsubscribe();
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
            new ContextMenuItem({ label: "View theme colors", click: () => this._gotoThemeColors() }),
            new ContextMenuSeparator(),
            new ContextMenuItem({ label: "Logout", click: () => this._logout() }),
        ];

        items.unshift(this._getAutoUpdateMenuItem());
        this.contextMenuService.openMenu(new ContextMenu(items));
    }

    private _goToSettings() {
        this.router.navigate(["/settings"]);
    }

    private _gotoThemeColors() {
        this.router.navigate(["/theme/colors"]);
    }

    private _openThirdPartyNotices() {
        this.shell.openItem(path.join(this.batchLabs.resourcesFolder, "ThirdPartyNotices.txt"));
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
                `Version: ${this.batchLabs.version}`,
                `Batch labs is licensed under MIT`,
                `Some icons are under Creative Commons Attribution-ShareAlike 3.0 Unported`,
            ].join("\n"),
        });
    }

    private _logout() {
        this.batchLabs.logoutAndLogin();
    }

    private async _checkForUpdates(showNotification = true) {
        const result = await this.autoUpdateService.checkForUpdates();
        if (!showNotification) { return; }
        if (result) {
            this._notify("Update available", `Update ${result.updateInfo.version} is now available.`, {
                action: () => this._update(),
            });
        } else {
            this._notify("There are no updates currently available.", `You  have the latest BatchLabs version.`);
        }

    }

    private _update() {
        if (OS.isWindows()) {
            setImmediate(() => {
                this.remote.electronApp.removeAllListeners("window-all-closed");
                this.autoUpdateService.quitAndInstall();
                this.remote.getCurrentWindow().close();
            });
        } else {
            this.shell.openExternal("https://azure.github.io/BatchLabs/");
        }
    }

    private _notify(title: string, description: string, options: any = {}) {
        this.zone.run((() => {
            this.notificationService.info(title, description, options);
        }));
    }

    private _getAutoUpdateMenuItem() {
        switch (this.updateStatus) {
            case UpdateStatus.Checking:
                return new ContextMenuItem({ label: "Checking for updates", enabled: false, click: () => null });
            case UpdateStatus.Downloading:
                return new ContextMenuItem({
                    label: `Downloading update ${this.autoUpdateService.updateInfo.version}`,
                    enabled: false, click: () => null,
                });
            case UpdateStatus.Ready:
                return new ContextMenuItem({
                    label: `Update to version ${this.autoUpdateService.updateInfo.version}`,
                    click: () => this._update(),
                });
            default:
                return new ContextMenuItem({ label: "Check for updates", click: () => this._checkForUpdates() });

        }
    }
}
