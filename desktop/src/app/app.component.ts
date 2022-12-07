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
    AuthSelectRequest,
    AuthSelectResult,
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
import { IpcEvent } from "common/constants";

@Component({
    selector: "bl-app",
    templateUrl: "app.layout.html",
})
export class AppComponent implements OnInit, OnDestroy {
    public isAppReady = false;
    public fullscreen = false;
    public showAuthOverlay = false;

    public authTenantId: string;
    public authRequestId: string;

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
        private remote: ElectronRemote,
        pythonRpcService: PythonRpcService,
        themeService: ThemeService,
        private route: ActivatedRoute,
        permissionService: PermissionService,
        authHttpService: AuthorizationHttpService,
        private authService: AuthService,
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

        this.registerAuthEvents();
        let initialNav = false;
        this.authService.isLoggedIn().pipe(takeUntil(this._destroy))
            .subscribe((isLoggedIn) => {
            if (!isLoggedIn) {
                // Always navigate to welcome page if not logged in
                this.navigatorService.goto("/welcome");
            } else {
                if (!initialNav) {
                    initialNav = true;
                    this.navigatorService.goto("/accounts");
                }
            }
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

    private registerAuthEvents() {
        this.authService.on("AuthSelect", (request: AuthSelectRequest) => {
            this.showAuthOverlay = true;
            this.authTenantId = request.tenantId;
            this.authRequestId = request.requestId;
        });
        this.authService.on("AuthSelectResult", (result: AuthSelectResult) => {
            this.remote.send(
                IpcEvent.userAuthSelectResponse(result.requestId),
                result
            );
            if (result.result === "cancel") {
                this.showAuthOverlay = false;
            }
        });
        this.authService.on("AuthComplete", (result) => {
            // Dismiss the overlay only if auth completed
            this.showAuthOverlay = false;
        });
        this.authService.on("Logout", () => {
            this.accountService.clear();
        });
    }
}
