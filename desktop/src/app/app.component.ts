import { Component, HostBinding, OnDestroy, OnInit } from "@angular/core";
import { MatIconRegistry } from "@angular/material/icon";
import { DomSanitizer } from "@angular/platform-browser";
import { ActivatedRoute } from "@angular/router";
import { KeyBindingsService, TelemetryService, UserConfigurationService } from "@batch-flask/core";
import BatchExplorerHttpClient from "@batch-flask/core/batch-explorer-http-client";
import { ElectronRemote, IpcService } from "@batch-flask/electron";
import { Workspace, WorkspaceService } from "@batch-flask/ui";
import { PermissionService } from "@batch-flask/ui/permission";
import { EnvironmentMode, initEnvironment } from "@batch/ui-common";
import { DependencyName } from "@batch/ui-common/lib/environment";
import { ConsoleLogger } from "@batch/ui-common/lib/logging";
import { BrowserDependencyName } from "@batch/ui-react";
import { DefaultFormLayoutProvider, DefaultParameterTypeResolver } from "@batch/ui-react/lib/components/form";
import { DefaultBrowserEnvironment } from "@batch/ui-react/lib/environment";
import { StorageAccountServiceImpl, SubscriptionServiceImpl } from "@batch/ui-service";
import { registerIcons } from "app/config";
import {
    AuthorizationHttpService,
    AuthService,
    BatchAccountService,
    NavigatorService,
    NcjTemplateService,
    PredefinedFormulaService,
    PricingService,
    PythonRpcService,
    SubscriptionService,
    ThemeService
} from "app/services";
import { BEUserConfiguration } from "common";
import { Environment } from "common/constants";
import { combineLatest, Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";

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
        private accountService: BatchAccountService,
        private navigatorService: NavigatorService,
        private subscriptionService: SubscriptionService,
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
    ) {
        // Initialize shared component lib environment
        initEnvironment(new DefaultBrowserEnvironment(
            {
                mode: ENV === Environment.prod ? EnvironmentMode.Production : EnvironmentMode.Development
            },
            {
                // TODO: Create an adapter which hooks up to the desktop logger
                [DependencyName.Logger]: () => new ConsoleLogger(),
                [DependencyName.HttpClient]:
                    () => new BatchExplorerHttpClient(authService, this.subscriptionService),
                [DependencyName.StorageAccountService]:
                    () => new StorageAccountServiceImpl(),
                [DependencyName.SubscriptionService]:
                    () => new SubscriptionServiceImpl(),
                [BrowserDependencyName.ParameterTypeResolver]:
                    () =>new DefaultParameterTypeResolver(),
                [BrowserDependencyName.FormLayoutProvider]:
                    () => new DefaultFormLayoutProvider(),
            }
        ));

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
            this.isAppReady = loadedArray[0] && loadedArray[1];
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
        const adminWorkspace = JSON.parse(require("app/components/workspace/json-templates/admin-workspace.json"));
        const endUserWorkspace = JSON.parse(require("app/components/workspace/json-templates/end-user-workspace.json"));
        this.workspaceService.init([
            new Workspace({ ...adminWorkspace }),
            new Workspace({ ...endUserWorkspace }),
        ]);
    }
}
