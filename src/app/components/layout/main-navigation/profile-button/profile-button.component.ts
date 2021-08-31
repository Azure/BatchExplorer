import { ChangeDetectionStrategy, ChangeDetectorRef, Component, NgZone, OnDestroy, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { I18nService, Locale, LocaleService, TranslatedLocales } from "@batch-flask/core";
import {
    AutoUpdateService,
    ElectronRemote,
    ElectronShell,
    FileSystemService,
    UpdateStatus,
} from "@batch-flask/electron";
import {
    ContextMenu, ContextMenuItem, ContextMenuSeparator, ContextMenuService, MultiContextMenuItem,
} from "@batch-flask/ui/context-menu";
import { NotificationService } from "@batch-flask/ui/notifications";
import { OS, log } from "@batch-flask/utils";
import {
    AuthService, BatchExplorerService,
} from "app/services";
import { Constants } from "common";
import * as path from "path";
import { Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";

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

    public downloadProgress: number;

    private _destroy = new Subject();

    constructor(
        private authService: AuthService,
        private i18n: I18nService,
        private localeService: LocaleService,
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

        authService.currentUser.pipe(takeUntil(this._destroy)).subscribe(user => {
            if (user) {
                this.currentUserName = `${user.name} (${user.username})`;
            } else {
                this.currentUserName = "";
            }
            this.changeDetector.markForCheck();
        });

        this.autoUpdateService.status.pipe(takeUntil(this._destroy)).subscribe((status) => {
            this.updateStatus = status;
            this.changeDetector.markForCheck();
        });
        this.autoUpdateService.downloadProgress.pipe(takeUntil(this._destroy)).subscribe((progress) => {
            if (progress) {
                this.downloadProgress = progress.percent;
            } else {
                this.downloadProgress = 0;
            }
            this.changeDetector.markForCheck();
        });
    }

    public ngOnInit() {
        this._checkForUpdates(false);
    }

    public ngOnDestroy() {
        this._destroy.next();
        this._destroy.complete();
    }

    public openSettingsContextMenu() {
        const items = [
            new ContextMenuSeparator(),
            new ContextMenuItem({
                label: this.i18n.t("profile-button.settings"),
                click: () => this._goToSettings()
            }),
            new ContextMenuItem({
                label: this.i18n.t("profile-button.authentication"),
                click: () => this._goToAuthSettings()
            }),
            new ContextMenuItem({
                label: this.i18n.t("profile-button.keybindings"), click: () => this._goToKeyBindings(),
            }),
            new MultiContextMenuItem({
                label: "Language (Preview)", subitems: Object.entries(TranslatedLocales).map(([key, value]) => {
                    return new ContextMenuItem({ label: value, click: () => this._changeLanguage(key as Locale) });
                }),
            }),
            new ContextMenuItem({
                label: this.i18n.t("profile-button.thirdPartyNotices"),
                click: () => this._openThirdPartyNotices(),
            }),
            new ContextMenuItem({ label: this.i18n.t("profile-button.viewLogs"), click: () => this._openLogFolder() }),
            new ContextMenuItem({ label: this.i18n.t("profile-button.report"), click: () => this._openGithubIssues() }),
            new ContextMenuItem({ label: this.i18n.t("profile-button.about"), click: () => this._showAboutPage() }),
            new ContextMenuSeparator(),
            new ContextMenuItem({
                label: this.i18n.t("profile-button.viewTheme"),
                click: () => this._gotoThemeColors(),
            }),
            new ContextMenuSeparator(),
            new ContextMenuItem({ label: this.i18n.t("profile-button.logout"), click: () => this._logout() }),
        ];

        items.unshift(this._getAutoUpdateMenuItem());
        this.contextMenuService.openMenu(new ContextMenu(items));
    }

    private _goToSettings() {
        this.router.navigate(["/settings"]);
    }

    private _goToAuthSettings() {
        this.router.navigate(["/auth-settings"]);
    }

    private _goToKeyBindings() {
        this.router.navigate(["/keybindings"]);
    }

    private _changeLanguage(locale: Locale) {
        this.localeService.setLocale(locale);
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
        this.shell.openExternal(Constants.ExternalLinks.submitIssue);
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
        try {
            const result = await this.autoUpdateService.checkForUpdates();
            if (!showNotification) { return; }
            if (result) {
                this._notify("Update available", `Update ${result.updateInfo.version} is now available.`, {
                    action: () => this._update(),
                });
            } else {
                this._notify("There are no updates currently available.",
                    `You  have the latest BatchExplorer version.`);
            }
        } catch (e) {
            log.error("Failed to check for updates");
            if (!showNotification) { return; }
            this.zone.run((() => {
                this.notificationService.error("Failed to check for updates", e.toString());
            }));
        }
    }

    private _update() {
        if (!OS.isLinux()) {
            setImmediate(async () => {
                this.remote.electronApp.removeAllListeners("window-all-closed");
                await this.authService.logout(false);
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
        const updateInfo = this.autoUpdateService.updateInfo;
        switch (this.updateStatus) {
            case UpdateStatus.Checking:
                return new ContextMenuItem({ label: "Checking for updates", enabled: false, click: () => null });
            case UpdateStatus.Downloading:
                return new ContextMenuItem({
                    label: `Downloading update ${updateInfo && updateInfo.version}`,
                    enabled: false, click: () => null,
                });
            case UpdateStatus.Ready:
                return new ContextMenuItem({
                    label: `Update to version ${updateInfo && updateInfo.version}`,
                    click: () => this._update(),
                });
            default:
                return new ContextMenuItem({ label: "Check for updates", click: () => this._checkForUpdates() });

        }
    }
}
