import { Location } from "@angular/common";
import { AfterViewInit, Component, OnInit, ViewChild } from "@angular/core";
import { MdIconRegistry, MdSidenav } from "@angular/material";
import { Observable } from "rxjs";

import { DomSanitizer } from "@angular/platform-browser";
import { registerIcons } from "app/config";
import {
    AccountService, AdalService, CommandService, NodeService,
    SSHKeyService, SettingsService, SubscriptionService, VmSizeService,
} from "app/services";
import { SidebarContentComponent, SidebarManager } from "./components/base/sidebar";

const adalConfig = {
    tenant: "common",
    clientId: "04b07795-8ddb-461a-bbee-02f9e1bf7b46", // Azure CLI
    redirectUri: "urn:ietf:wg:oauth:2.0:oob",
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
        mdIconRegistry: MdIconRegistry,
        sanitizer: DomSanitizer,
        private sidebarManager: SidebarManager,
        private settingsService: SettingsService,
        private commandService: CommandService,
        private adalService: AdalService,
        private accountService: AccountService,
        private subscriptionService: SubscriptionService,
        private nodeService: NodeService,
        private sshKeyService: SSHKeyService,
        private vmSizeService: VmSizeService) {
        this.settingsService.init();
        this.sshKeyService.init();
        this.commandService.init();
        this.vmSizeService.init();
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

        registerIcons(mdIconRegistry, sanitizer);
    }

    public ngAfterViewInit() {
        // Give the reference to the sidebar to the sidebar manager
        this.sidebarManager.sidebar = this.sidebar;
        this.sidebarManager.sidebarContent = this.sidebarContent;
    }

    public ngOnInit() {
        this.adalService.login();
        this.subscriptionService.load();
        this.accountService.load();
    }

    public open() {
        this.sidebar.open();
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
        this.nodeService.listNodeAgentSkus().fetchAll();
    }
}
