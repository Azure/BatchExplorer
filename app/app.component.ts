import { Location } from "@angular/common";
import { AfterViewInit, Component, OnInit, ViewChild } from "@angular/core";
import { MdSidenav } from "@angular/material";
import { BehaviorSubject, Observable } from "rxjs";

import { AccountService, AdalService, CommandService, SettingsService } from "app/services";
import AccountCreateDialogComponent from "./components/account/add/account-create-dialog.component";
import { SidebarContentComponent, SidebarManager } from "./components/base/sidebar";

const adalConfig = {
    tenant: "microsoft.onmicrosoft.com",
    clientId: "94ef904d-c21a-4672-9946-b4d6a12b8e13",
    redirectUri: "http://localhost",
};

@Component({
    selector: "bex-app",
    templateUrl: "app.layout.html",
})
export class AppComponent implements AfterViewInit, OnInit {
    public hasAccount: Observable<boolean>;
    public isAppReady = new BehaviorSubject<boolean>(false);

    @ViewChild("rightSidebar")
    private sidebar: MdSidenav;

    @ViewChild("sidebarContent")
    private sidebarContent: SidebarContentComponent;

    constructor(
        private location: Location,
        private sidebarManager: SidebarManager,
        private settingsService: SettingsService,
        private commandService: CommandService,
        private adalService: AdalService,
        private accountService: AccountService) {
        this.settingsService.init();
        this.commandService.init();
        this.adalService.init(adalConfig);
        this.accountService.loadInitialData();

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
    }

    public ngOnInit() {
        this.adalService.login();
    }

    public open() {
        this.sidebar.open();
    }

    public addAccount() {
        this.sidebarManager.open("add-account", AccountCreateDialogComponent);
    }

    public logout() {
        this.adalService.logout();
    }

    public goBack() {
        this.location.back();
    }

    public goForward() {
        this.location.forward();
    }
}
