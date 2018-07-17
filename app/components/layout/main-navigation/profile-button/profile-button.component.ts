import { ChangeDetectionStrategy, ChangeDetectorRef, Component, NgZone, OnDestroy, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { AutoUpdateService, ElectronRemote, ElectronShell, UpdateStatus } from "@batch-flask/ui";
import { OS } from "@batch-flask/utils";
import * as path from "path";
import { Subscription } from "rxjs";

import {
    ContextMenu, ContextMenuItem, ContextMenuSeparator, ContextMenuService,
} from "@batch-flask/ui/context-menu";
import { NotificationService } from "@batch-flask/ui/notifications";
import {
    AdalService, BatchExplorerService, FileSystemService,
} from "app/services";

import "./profile-button.scss";

@Component({
    selector: "bl-profile-button",
    templateUrl: "profile-button.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileButtonComponent implements OnDestroy, OnInit {
    public UpdateStatus = UpdateStatus;

    public currentUserName: string = "";
    public updateStatus: UpdateStatus;

    private _currentUserSub: Subscription;
    private _updateSub: Subscription;

    constructor(
        adalService: AdalService,
        private changeDetector: ChangeDetectorRef,
        private autoUpdateService: AutoUpdateService,
        private batchExplorer: BatchExplorerService,
        private shell: ElectronShell,
        private remote: ElectronRemote,
        private contextMenuService: ContextMenuService,
        private zone: NgZone,
        private notificationService: NotificationService,
        private fs: FileSystemService,
        private router: Router) {

        this._currentUserSub = adalService.currentUser.subscribe((user) => {
            if (user) {
                this.currentUserName = `${user.name} (${user.unique_name})`;
            } else {
                this.currentUserName = "";
            }
            this.changeDetector.markForCheck();
        });

        this._updateSub = this.autoUpdateService.status.subscribe((status) => {
            this.updateStatus = status;
            this.changeDetector.markForCheck();
        });
    }

    public ngOnInit() {
        this._checkForUpdates(false);
    }

    public ngOnDestroy() {
        this._currentUserSub.unsubscribe();
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
        this.shell.openItem(path.join(this.batchExplorer.resourcesFolder, "ThirdPartyNotices.txt"));
    }

    private _openLogFolder() {
        this.shell.openItem(path.join(this.fs.commonFolders.userData, "logs"));
    }

    private _openGithubIssues() {
        this.shell.openExternal("https://github.com/Azure/BatchExplorer/issues");
    }

    private _showAboutPage() {
        this.remote.dialog.showMessageBox({
            type: "info",
            title: "BatchExplorer",
            message: [
                `Version: ${this.batchExplorer.version}`,
                `Batch Explorer is licensed under MIT`,
                `Some icons are under Creative Commons Attribution-ShareAlike 3.0 Unported`,
            ].join("\n"),
        });
    }

    private _logout() {
        this.batchExplorer.logoutAndLogin();
    }

    private async _checkForUpdates(showNotification = true) {
        const result = await this.autoUpdateService.checkForUpdates();
        if (!showNotification) { return; }
        if (result) {
            this._notify("Update available", `Update ${result.updateInfo.version} is now available.`, {
                action: () => this._update(),
            });
        } else {
            this._notify("There are no updates currently available.", `You  have the latest BatchExplorer version.`);
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
            this.shell.openExternal("https://azure.github.io/BatchExplorer/");
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
