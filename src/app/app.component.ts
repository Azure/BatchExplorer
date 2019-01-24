import { Component, HostBinding, OnDestroy, OnInit } from "@angular/core";
import { MatIconRegistry } from "@angular/material";
import { DomSanitizer } from "@angular/platform-browser";
import { Subject, combineLatest } from "rxjs";

import { ActivatedRoute } from "@angular/router";
import { TelemetryService } from "@batch-flask/core";
import { ElectronRemote, IpcService } from "@batch-flask/electron";
import { Workspace, WorkspaceService } from "@batch-flask/ui";
import { PermissionService } from "@batch-flask/ui/permission";
import { registerIcons } from "app/config";
import {
    AuthorizationHttpService,
    BatchAccountService,
    CommandService,
    NavigatorService,
    NcjTemplateService,
    PoolOsService,
    PredefinedFormulaService,
    PricingService,
    PythonRpcService,
    SettingsService,
    SubscriptionService,
    ThemeService,
} from "app/services";
import { filter, first, takeUntil } from "rxjs/operators";

@Component({
    selector: "bl-app",
    templateUrl: "app.layout.html",
})
export class AppComponent implements OnInit, OnDestroy {
    public isAppReady = false;
    public fullscreen = false;

    @HostBinding("class.batch-explorer") public readonly beCls = true;
    @HostBinding("class.high-contrast") public isHighContrast = false;

    private _destroy = new Subject();

    constructor(
        matIconRegistry: MatIconRegistry,
        sanitizer: DomSanitizer,
        private settingsService: SettingsService,
        private commandService: CommandService,
        private accountService: BatchAccountService,
        private navigatorService: NavigatorService,
        private subscriptionService: SubscriptionService,
        private poolOsService: PoolOsService,
        remote: ElectronRemote,
        pythonRpcService: PythonRpcService,
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
        this.settingsService.init();
        this._initWorkspaces();
        this.commandService.init();
        this.pricingService.init();
        this.navigatorService.init();
        this.accountService.loadInitialData();
        this.ncjTemplateService.init();
        pythonRpcService.init();
        this.predefinedFormulaService.init();
        themeService.init();

        combineLatest(
            settingsService.hasSettingsLoaded,
            workspaceService.haveWorkspacesLoaded,
        ).pipe(takeUntil(this._destroy)).subscribe((loadedArray) => {
            this.isAppReady = loadedArray[0] && loadedArray[1];
        });

        // Wait for the first account to be loaded.
        accountService.currentAccount.pipe(
            takeUntil(this._destroy),
            filter(x => Boolean(x)),
            first(),
        ).subscribe((x) => {
            this._preloadData();
        });

        registerIcons(matIconRegistry, sanitizer);

        this.route.queryParams.pipe(takeUntil(this._destroy)).subscribe(({ fullscreen }) => {
            this.fullscreen = Boolean(fullscreen);
        });

        permissionService.setUserPermissionProvider(() => {
            return authHttpService.getResourcePermission();
        });

        ipc.sendEvent("app-ready");

        themeService.currentTheme.pipe(takeUntil(this._destroy)).subscribe((theme) => {
            this.isHighContrast = theme.isHighContrast;
        });
    }

    public ngOnInit() {
        this.subscriptionService.load();
        this.accountService.load().subscribe();
    }

    public ngOnDestroy() {
        this._destroy.next();
        this._destroy.complete();
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
