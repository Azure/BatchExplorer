import { Component, HostBinding, OnDestroy, OnInit } from "@angular/core";
import { MatIconRegistry } from "@angular/material/icon";
import { DomSanitizer } from "@angular/platform-browser";
import { ActivatedRoute } from "@angular/router";
import { KeyBindingsService, TelemetryService, UserConfigurationService } from "@batch-flask/core";
import { ElectronRemote, IpcService } from "@batch-flask/electron";
import { Workspace, WorkspaceService } from "@batch-flask/ui";
import { PermissionService } from "@batch-flask/ui/permission";
import { registerIcons } from "app/config";
import {
    AppTranslationsLoaderService,
    AuthService,
    AuthorizationHttpService,
    BatchAccountService,
    BatchExplorerService,
    NavigatorService,
    NcjTemplateService,
    PredefinedFormulaService,
    PricingService,
    PythonRpcService,
    ThemeService
} from "app/services";
import { BEUserConfiguration } from "common";
import { Subject, combineLatest } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { initDesktopEnvironment } from "./environment/desktop-environment";

@Component({
    selector: "bl-app",
    templateUrl: "app.layout.html",
})
export class AppComponent implements OnInit, OnDestroy {
    public isAppReady = false;
    public fullscreen = false;

    @HostBinding("class.batch-explorer") public readonly beCls = true;
    @HostBinding("class.high-contrast") public isHighContrast = false;

    private _envInitialized = false;
    private _destroy = new Subject();

    constructor(
        matIconRegistry: MatIconRegistry,
        sanitizer: DomSanitizer,
        private accountService: BatchAccountService,
        private navigatorService: NavigatorService,
        userConfigurationService: UserConfigurationService<BEUserConfiguration>,
        remote: ElectronRemote,
        pythonRpcService: PythonRpcService,
        themeService: ThemeService,
        private route: ActivatedRoute,
        permissionService: PermissionService,
        authHttpService: AuthorizationHttpService,
        authService: AuthService,
        ipc: IpcService,
        keybindingService: KeyBindingsService,
        private telemetryService: TelemetryService,
        private pricingService: PricingService,
        private ncjTemplateService: NcjTemplateService,
        private predefinedFormulaService: PredefinedFormulaService,
        private workspaceService: WorkspaceService,
        private translationsLoaderService: AppTranslationsLoaderService,
        private batchExplorer: BatchExplorerService
    ) {
        this.telemetryService.init(remote.getCurrentWindow().TELEMETRY_ENABLED);
        this._initWorkspaces();
        this.pricingService.init();
        keybindingService.listen();
        this.navigatorService.init();
        this.accountService.loadInitialData();
        this.ncjTemplateService.init();
        pythonRpcService.init();
        this.predefinedFormulaService.init();
        themeService.init();

        combineLatest(
            userConfigurationService.config,
            workspaceService.haveWorkspacesLoaded,
        ).pipe(takeUntil(this._destroy)).subscribe((loadedArray) => {
            const ready = loadedArray[0] && loadedArray[1];

            if (ready && !this._envInitialized) {
                initDesktopEnvironment(translationsLoaderService, authService, batchExplorer);
                this._envInitialized = true;
            }

            this.isAppReady = ready;
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
        this.accountService.loadSubscriptionsAndAccounts();
    }

    public ngOnDestroy() {
        this._destroy.next();
        this._destroy.complete();
    }

    private async _initWorkspaces() {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const adminWorkspace = JSON.parse(require("app/components/workspace/json-templates/admin-workspace.json"));
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const endUserWorkspace = JSON.parse(require("app/components/workspace/json-templates/end-user-workspace.json"));
        this.workspaceService.init([
            new Workspace({ ...adminWorkspace }),
            new Workspace({ ...endUserWorkspace }),
        ]);
    }
}
