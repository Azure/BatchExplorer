import { Component, OnInit } from "@angular/core";
import { MatIconRegistry } from "@angular/material";
import { DomSanitizer } from "@angular/platform-browser";
import { combineLatest } from "rxjs";

import { ActivatedRoute } from "@angular/router";
import { TelemetryService } from "@batch-flask/core";
import { ElectronRemote, IpcService, Workspace, WorkspaceService } from "@batch-flask/ui";
import { PermissionService } from "@batch-flask/ui/permission";
import { registerIcons } from "app/config";
import {
    AuthorizationHttpService,
    AutoscaleFormulaService,
    BatchAccountService,
    CommandService,
    GithubDataService,
    NavigatorService,
    NcjTemplateService,
    PoolOsService,
    PredefinedFormulaService,
    PricingService,
    PythonRpcService,
    SSHKeyService,
    SettingsService,
    SubscriptionService,
    ThemeService,
    VmSizeService,
} from "app/services";
import { filter, first } from "rxjs/operators";

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
        private accountService: BatchAccountService,
        private navigatorService: NavigatorService,
        private subscriptionService: SubscriptionService,
        private githubDataService: GithubDataService,
        private poolOsService: PoolOsService,
        private sshKeyService: SSHKeyService,
        remote: ElectronRemote,
        pythonRpcService: PythonRpcService,
        private vmSizeService: VmSizeService,
        themeService: ThemeService,
        private route: ActivatedRoute,
        permissionService: PermissionService,
        authHttpService: AuthorizationHttpService,
        ipc: IpcService,
        private telemetryService: TelemetryService,
        private pricingService: PricingService,
        private ncjTemplateService: NcjTemplateService,
        private predefinedFormulaService: PredefinedFormulaService,
        private workspaceService: WorkspaceService,
    ) {
        this.telemetryService.init(remote.getCurrentWindow().TELEMETRY_ENABLED);
        this.autoscaleFormulaService.init();
        this.settingsService.init();
        this._initWorkspaces();
        this.githubDataService.init();
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

        combineLatest(
            settingsService.hasSettingsLoaded,
            workspaceService.haveWorkspacesLoaded,
        ).subscribe((loadedArray) => {
            this.isAppReady = loadedArray[0] && loadedArray[1];
        });

        // Wait for the first account to be loaded.
        accountService.currentAccount.pipe(
            filter(x => Boolean(x)),
            first(),
        ).subscribe((x) => {
            this._preloadData();
        });

        registerIcons(matIconRegistry, sanitizer);

        this.route.queryParams.subscribe(({ fullscreen }) => {
            this.fullscreen = Boolean(fullscreen);
        });

        permissionService.setUserPermissionProvider(() => {
            return authHttpService.getResourcePermission();
        });

        ipc.sendEvent("app-ready");
    }

    public ngOnInit() {
        this.subscriptionService.load();
        this.accountService.load().subscribe();
    }

    /**
     * Preload some data needed.
     */
    private _preloadData() {
        this.poolOsService.refresh();
    }

    private async _initWorkspaces() {
        const adminWorkspace = JSON.parse(require("app/components/workspace/json-templates/admin-workspace.json"));
        const endUserWorkspace = JSON.parse(require("app/components/workspace/json-templates/end-user-workspace.json"));
        this.workspaceService.init([
            new Workspace({ ...adminWorkspace }),
            new Workspace({ ...endUserWorkspace }),
        ]);
    }
}
