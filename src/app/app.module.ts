import { HashLocationStrategy, LocationStrategy } from "@angular/common";
import { HttpClientModule } from "@angular/common/http";
import { ErrorHandler, NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { BrowserModule } from "@angular/platform-browser";
import { NoopAnimationsModule } from "@angular/platform-browser/animations";
import { PreloadAllModules, RouterModule } from "@angular/router";

// application router
import { routes } from "./app.routes";

// components
import { AppComponent } from "app/app.component";

// extenal modules
import { BaseModule } from "@batch-flask/ui";
import { AccountModule } from "app/components/account/account.module";
import { FileModule } from "app/components/file/file.module";
import { SettingsModule } from "app/components/settings";

// unhandled application error handler
import { BatchExplorerErrorHandler } from "app/error-handler";

// services
import { LocaleService, MaterialModule, TranslationsLoaderService } from "@batch-flask/core";
import { CommonModule } from "app/components/common";
import { LayoutModule } from "app/components/layout";
import { MiscModule } from "app/components/misc";
import { AzureBatchHttpService } from "app/services/azure-batch/core";
import { AADApplicationService, ServicePrincipalService } from "app/services/ms-graph";
import { AADGraphHttpService, MsGraphHttpService } from "app/services/ms-graph/core";
import {
    AutoStorageService, StorageAccountKeysService, StorageBlobService, StorageClientService, StorageContainerService,
} from "app/services/storage";
import {
    AdalService,
    AppInsightsApiService,
    AppInsightsQueryService,
    AppLocaleService,
    AppTranslationsLoaderService,
    ApplicationService,
    ArmBatchAccountService,
    ArmHttpService,
    AuthorizationHttpService,
    AutoscaleFormulaService,
    AzureHttpService,
    BatchAccountService,
    BatchExplorerService,
    CacheDataService,
    CertificateService,
    CommandService,
    ComputeService,
    FileService,
    GithubDataService,
    HttpUploadService,
    InsightsMetricsService,
    JobHookTaskService,
    JobScheduleService,
    JobService,
    LocalBatchAccountService,
    LocalFileStorage,
    NavigatorService,
    NcjFileGroupService,
    NcjModule,
    NcjSubmitService,
    NetworkConfigurationService,
    NodeConnectService,
    NodeService,
    NodeUserService,
    PinnedEntityService,
    PoolNodeCountService,
    PoolOsService,
    PoolService,
    PredefinedFormulaService,
    PricingService,
    PythonRpcService,
    QuotaService,
    ResourceAccessService,
    SSHKeyService,
    SettingsService,
    StorageAccountService,
    SubscriptionService,
    TaskService,
    TenantDetailsService,
    ThemeService,
    VersionService,
    VmSizeService,
} from "./services";
import { UsageDetailsService } from "./services/azure-consumption";
import { RendererTelemetryModule } from "./services/telemetry";

const modules = [
    AccountModule,
    FileModule,
    SettingsModule,
    LayoutModule,
    MiscModule,
    NcjModule,
];

const graphApiServices = [AADApplicationService, AADGraphHttpService, MsGraphHttpService, ServicePrincipalService];

@NgModule({
    bootstrap: [
        AppComponent,
    ],
    declarations: [
        AppComponent,
    ],
    entryComponents: [
        // imported in specific area modules
    ],
    imports: [
        NoopAnimationsModule,
        BrowserModule,
        FormsModule,
        MaterialModule,
        ReactiveFormsModule,
        RendererTelemetryModule,
        RouterModule.forRoot(routes, {
            // useHash: true,
            paramsInheritanceStrategy: "always",
            preloadingStrategy: PreloadAllModules,
        }),
        BaseModule,
        HttpClientModule,
        ...modules,
    ],
    providers: [
        { provide: LocationStrategy, useClass: HashLocationStrategy },
        { provide: TranslationsLoaderService, useClass: AppTranslationsLoaderService },
        { provide: LocaleService, useClass: AppLocaleService },
        ArmBatchAccountService,
        BatchAccountService,
        LocalBatchAccountService,
        AdalService,
        AppInsightsApiService,
        AppInsightsQueryService,
        ApplicationService,
        AutoscaleFormulaService,
        AzureBatchHttpService,
        AzureHttpService,
        ArmHttpService,
        AuthorizationHttpService,
        BatchExplorerService,
        CacheDataService,
        CertificateService,
        CommandService,
        CommonModule,
        ComputeService,
        NodeConnectService,
        FileService,
        GithubDataService,
        HttpUploadService,
        InsightsMetricsService,
        JobHookTaskService,
        JobScheduleService,
        JobService,
        LocalFileStorage,
        NavigatorService,
        NcjFileGroupService,
        NcjSubmitService,
        NetworkConfigurationService,
        NodeService,
        NodeUserService,
        PinnedEntityService,
        PoolService,
        PoolNodeCountService,
        PoolOsService,
        PricingService,
        QuotaService,
        PythonRpcService,
        ResourceAccessService,
        SettingsService,
        AutoStorageService,
        StorageAccountService,
        StorageClientService,
        StorageAccountKeysService,
        StorageContainerService,
        StorageBlobService,
        SSHKeyService,
        SubscriptionService,
        TaskService,
        TenantDetailsService,
        ThemeService,
        VersionService,
        VmSizeService,
        PredefinedFormulaService,
        UsageDetailsService,
        ...graphApiServices,
        { provide: ErrorHandler, useClass: BatchExplorerErrorHandler },
    ],
})
export class AppModule { }
