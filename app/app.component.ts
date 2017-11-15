import { Location } from "@angular/common";
import { AfterViewInit, Component, OnInit, ViewChild } from "@angular/core";
import { MatIconRegistry, MatSidenav } from "@angular/material";
import { DomSanitizer } from "@angular/platform-browser";
import { Observable } from "rxjs";

import { registerIcons } from "app/config";
import {
    AccountService, AdalService, AutoscaleFormulaService, CommandService, MonacoLoader,
    NcjTemplateService, NodeService, PredefinedFormulaService, PricingService, PythonRpcService, SSHKeyService,
    SettingsService,
    SubscriptionService,
    VmSizeService,
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
    private sidebar: MatSidenav;

    @ViewChild("sidebarContent")
    private sidebarContent: SidebarContentComponent;

    constructor(
        private location: Location,
        matIconRegistry: MatIconRegistry,
        sanitizer: DomSanitizer,
        private sidebarManager: SidebarManager,
        private autoscaleFormulaService: AutoscaleFormulaService,
        private settingsService: SettingsService,
        private commandService: CommandService,
        private adalService: AdalService,
        private accountService: AccountService,
        private subscriptionService: SubscriptionService,
        private nodeService: NodeService,
        private sshKeyService: SSHKeyService,
        pythonRpcService: PythonRpcService,
        private vmSizeService: VmSizeService,
        monacoLoader: MonacoLoader,
        private pricingService: PricingService,
        private ncjTemplateService: NcjTemplateService,
        private predefinedFormulaService: PredefinedFormulaService,
    ) {
        this.autoscaleFormulaService.init();
        this.settingsService.init();
        this.sshKeyService.init();
        this.commandService.init();
        this.pricingService.init();
        this.vmSizeService.init();
        this.adalService.init(adalConfig);
        this.accountService.loadInitialData();
        this.ncjTemplateService.init();
        pythonRpcService.init();
        this.predefinedFormulaService.init();
        monacoLoader.get();
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

        registerIcons(matIconRegistry, sanitizer);
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
