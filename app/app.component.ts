import { AfterViewInit, Component, OnInit, ViewChild } from "@angular/core";
import { MatIconRegistry, MatSidenav } from "@angular/material";
import { DomSanitizer } from "@angular/platform-browser";
import { Observable } from "rxjs";

import { ActivatedRoute } from "@angular/router";
import { registerIcons } from "app/config";
import {
    AccountService, AdalService, AutoscaleFormulaService, CommandService, MonacoLoader,
    NavigatorService, NcjTemplateService, NodeService, PredefinedFormulaService, PricingService,
    PythonRpcService, SSHKeyService, SettingsService, SubscriptionService, VmSizeService,
} from "app/services";
import { ipcRenderer } from "electron";
import { SidebarContentComponent, SidebarManager } from "./components/base/sidebar";

@Component({
    selector: "bl-app",
    templateUrl: "app.layout.html",
})
export class AppComponent implements AfterViewInit, OnInit {
    public isAppReady = false;
    public fullscreen = false;

    @ViewChild("rightSidebar")
    private sidebar: MatSidenav;

    @ViewChild("sidebarContent")
    private sidebarContent: SidebarContentComponent;

    constructor(
        matIconRegistry: MatIconRegistry,
        sanitizer: DomSanitizer,
        private sidebarManager: SidebarManager,
        private autoscaleFormulaService: AutoscaleFormulaService,
        private settingsService: SettingsService,
        private commandService: CommandService,
        private adalService: AdalService,
        private accountService: AccountService,
        private navigatorService: NavigatorService,
        private subscriptionService: SubscriptionService,
        private nodeService: NodeService,
        private sshKeyService: SSHKeyService,
        pythonRpcService: PythonRpcService,
        private vmSizeService: VmSizeService,
        private route: ActivatedRoute,
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
        this.navigatorService.init();
        this.vmSizeService.init();
        this.accountService.loadInitialData();
        this.ncjTemplateService.init();
        pythonRpcService.init();
        this.predefinedFormulaService.init();
        monacoLoader.get();

        Observable
            .combineLatest(accountService.accountLoaded, settingsService.hasSettingsLoaded)
            .subscribe((loadedArray) => {
                this.isAppReady = loadedArray[0] && loadedArray[1];
                console.log("Is app ready...", this.isAppReady);
            });

        // Wait for the first account to be loaded.
        accountService.currentAccount.filter(x => Boolean(x)).first().subscribe((x) => {
            this._preloadData();
        });

        registerIcons(matIconRegistry, sanitizer);

        this.route.queryParams.subscribe(({ fullscreen }) => {
            console.log("Got query params", fullscreen);
            this.fullscreen = Boolean(fullscreen);
        });

        ipcRenderer.send("app-ready");
    }

    public ngAfterViewInit() {
        // Give the reference to the sidebar to the sidebar manager
        this.sidebarManager.sidebar = this.sidebar;
        this.sidebarManager.sidebarContent = this.sidebarContent;
    }

    public ngOnInit() {
        this.subscriptionService.load();
        this.accountService.load();
    }

    public open() {
        this.sidebar.open();
    }

    public logout() {
        this.adalService.logout();
    }

    /**
     * Preload some data needed.
     */
    private _preloadData() {
        this.nodeService.listNodeAgentSkus().fetchAll();
    }
}
