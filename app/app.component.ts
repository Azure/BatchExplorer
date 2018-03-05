import { Component, OnInit } from "@angular/core";
import { MatIconRegistry } from "@angular/material";
import { DomSanitizer } from "@angular/platform-browser";
import { Observable } from "rxjs";

import { ActivatedRoute } from "@angular/router";
import { MonacoLoader } from "@batch-flask/ui/editor";
import { PermissionService } from "@batch-flask/ui/permission";
import { registerIcons } from "app/config";
import {
    AccountService, AdalService, AuthorizationHttpService, AutoscaleFormulaService,
    CommandService, NavigatorService, NcjTemplateService, NodeService, PredefinedFormulaService,
    PricingService, PythonRpcService, SSHKeyService, SettingsService, SubscriptionService, ThemeService, VmSizeService,
} from "app/services";
import { Constants } from "app/utils";
import { ipcRenderer } from "electron";

@Component({
    selector: "bl-app",
    templateUrl: "app.layout.html",
})
export class AppComponent implements OnInit {
    public isAppReady = false;
    public fullscreen = false;

    constructor(
        matIconRegistry: MatIconRegistry,
        sanitizer: DomSanitizer,
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
        themeService: ThemeService,
        private route: ActivatedRoute,
        monacoLoader: MonacoLoader,
        permissionService: PermissionService,
        authHttpService: AuthorizationHttpService,
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
        themeService.init();
        monacoLoader.init(Constants.Client.root);

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

        this.route.queryParams.subscribe(({ fullscreen }) => {
            // console.log("Query params?", fullscreen);
            this.fullscreen = Boolean(fullscreen);
        });
        permissionService.setUserPermissionProvider(() => {
            return authHttpService.getResourcePermission();
        });

        ipcRenderer.send("app-ready");
    }

    public ngOnInit() {
        this.subscriptionService.load();
        this.accountService.load();
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
