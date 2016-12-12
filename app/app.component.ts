import { AfterViewInit, Component, ViewChild } from "@angular/core";
import { MdSidenav } from "@angular/material";
import { BehaviorSubject, Observable } from "rxjs";

import { AccountService, CommandService, SettingsService } from "app/services";
import AccountCreateDialogComponent from "./components/account/add/account-create-dialog.component";
import { SidebarContentComponent, SidebarManager } from "./components/base/sidebar";
import { NotificationManager } from "./components/base/notifications";

@Component({
    selector: "bex-app",
    templateUrl: "app.layout.html",
})
export class AppComponent implements AfterViewInit {
    public hasAccount: Observable<boolean>;
    public isAppReady = new BehaviorSubject<boolean>(false);

    @ViewChild("rightSidebar")
    private sidebar: MdSidenav;

    @ViewChild("sidebarContent")
    private sidebarContent: SidebarContentComponent;

    constructor(
        private sidebarManager: SidebarManager,
        private settingsService: SettingsService,
        private commandService: CommandService,
        private accountService: AccountService,
        private notificationManager: NotificationManager) {
        this.hasAccount = accountService.currentAccount.map((x) => { return Boolean(x); });

        Observable
            .combineLatest(accountService.accountLoaded, settingsService.hasSettingsLoaded)
            .subscribe((loadedArray) => {
                this.isAppReady.next(loadedArray[0] && loadedArray[1]);
            });
    }

    public ngAfterViewInit() {
        // Give the reference to the sidebar to the sidebar manager
        this.sidebarManager.sidebar = this.sidebar;
        this.sidebarManager.sidebarContent = this.sidebarContent;
        this.notificationManager.info("Something happend!", "Letting you know that something happend.");
        this.notificationManager.error("An error occured!", "Seems like something broke");
        this.notificationManager.success("Great success!", "Thing completed success fullyy");
    }

    public open() {
        this.sidebar.open();
    }

    public addAccount() {
        this.sidebarManager.open("add-account", AccountCreateDialogComponent);
    }
}
