import { Location } from "@angular/common";
import { AfterViewInit, Component, OnInit, ViewChild } from "@angular/core";
import { MdSidenav } from "@angular/material";
import { Observable } from "rxjs";

import { AccountService, AdalService, CommandService, NodeService, SSHKeyService, SettingsService } from "app/services";
import AccountCreateDialogComponent from "./components/account/add/account-create-dialog.component";
import { SidebarContentComponent, SidebarManager } from "./components/base/sidebar";

const adalConfig = {
    tenant: "microsoft.onmicrosoft.com",
    clientId: "94ef904d-c21a-4672-9946-b4d6a12b8e13",
    redirectUri: "http://localhost",
};

@Component({
    selector: "bl-app",
    templateUrl: "app.layout.html",
})
export class AppComponent implements AfterViewInit, OnInit {
    public hasAccount: Observable<boolean>;
    public isAppReady = false;

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
        private accountService: AccountService,
        private nodeService: NodeService,
        private sshKeyService: SSHKeyService) {
        this.settingsService.init();
        this.sshKeyService.init();
        this.commandService.init();
        this.adalService.init(adalConfig);
        this.accountService.loadInitialData();

        this.hasAccount = accountService.currentAccount.map((x) => Boolean(x));

        Observable
            .combineLatest(accountService.accountLoaded, settingsService.hasSettingsLoaded)
            .subscribe((loadedArray) => {
                this.isAppReady = loadedArray[0] && loadedArray[1];
            });

        // Wait for the first account to be loaded.
        accountService.currentAccount.filter(x => Boolean(x)).first().subscribe((x) => {
            this._preloadData();
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

    /**
     * Preload some data needed.
     */
    private _preloadData() {
        console.log("appcompone", this.nodeService);
        this.nodeService.listNodeAgentSkus().fetchAll();
    }
}
