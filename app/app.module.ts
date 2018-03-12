import { HashLocationStrategy, LocationStrategy } from "@angular/common";
import { HttpClientModule } from "@angular/common/http";
import { ErrorHandler, NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { BrowserModule } from "@angular/platform-browser";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { RouterModule } from "@angular/router";

// application router
import { routes } from "./app.routes";

// components
import { AppComponent } from "app/app.component";
import { MainNavigationComponent } from "app/components/shared/main-navigation.component";

// extenal modules
import { BaseModule } from "@batch-flask/ui";
import { AccountModule } from "app/components/account/account.module";
import { ApplicationModule } from "app/components/application/application.module";
import { DataModule } from "app/components/data/data.module";
import { FileModule } from "app/components/file/file.module";
import { JobScheduleModule } from "app/components/job-schedule/job-schedule.module";
import { JobModule } from "app/components/job/job.module";
import { MarketModule } from "app/components/market/market.module";
import { NodeModule } from "app/components/node/node.module";
import { PoolModule } from "app/components/pool/pool.module";
import { SettingsModule } from "app/components/settings";
import { TaskModule } from "app/components/task/task.module";

// unhandled application error handler
import { BatchLabsErrorHandler } from "app/error-handler";

// services
import { HttpModule } from "@angular/http";
import { MaterialModule } from "@batch-flask/core";
import { CommonModule } from "app/components/common";
import { LayoutModule } from "app/components/layout";
import { MiscModule } from "app/components/misc";
import { PollService } from "app/services/core";
import { AADApplicationService, ServicePrincipalService } from "app/services/ms-graph";
import { AADGraphHttpService, MsGraphHttpService } from "app/services/ms-graph/core";
import {
    AccountService,
    AdalService,
    AppInsightsApiService,
    AppInsightsQueryService,
    ApplicationService,
    ArmHttpService,
    AuthorizationHttpService,
    AutoscaleFormulaService,
    AzureHttpService,
    BatchClientService,
    BatchLabsService,
    CacheDataService,
    CommandService,
    ComputeService,
    ElectronRemote,
    ElectronShell,
    FileService,
    FileSystemService,
    GithubDataService,
    HttpUploadService,
    InsightsMetricsService,
    IpcService,
    JobHookTaskService,
    JobScheduleService,
    JobService,
    LocalFileStorage,
    NavigatorService,
    NcjFileGroupService,
    NcjSubmitService,
    NcjTemplateService,
    NetworkConfigurationService,
    NodeService,
    NodeUserService,
    PinnedEntityService,
    PoolService,
    PredefinedFormulaService,
    PricingService,
    PythonRpcService,
    QuotaService,
    ResourceAccessService,
    SSHKeyService,
    SettingsService,
    StorageAccountService,
    StorageClientService,
    StorageService,
    SubscriptionService,
    TaskService,
    ThemeService,
    VmSizeService,
} from "./services";

const modules = [
    AccountModule, ApplicationModule, DataModule,
    FileModule, JobModule, JobScheduleModule, NodeModule, PoolModule,
    SettingsModule, TaskModule, MarketModule, LayoutModule,
    MiscModule,
];

const graphApiServices = [AADApplicationService, AADGraphHttpService, MsGraphHttpService, ServicePrincipalService];

@NgModule({
    bootstrap: [
        AppComponent,
    ],
    declarations: [
        AppComponent,
        MainNavigationComponent,
    ],
    entryComponents: [
        // imported in specific area modules
    ],
    imports: [
        BrowserAnimationsModule,
        BrowserModule,
        FormsModule,
        MaterialModule,
        ReactiveFormsModule,
        HttpModule,
        RouterModule.forRoot(routes, { useHash: true }),
        BaseModule,
        HttpClientModule,
        ...modules,
    ],
    providers: [
        { provide: LocationStrategy, useClass: HashLocationStrategy },
        AccountService,
        AdalService,
        AppInsightsApiService,
        AppInsightsQueryService,
        ApplicationService,
        AutoscaleFormulaService,
        AzureHttpService,
        ArmHttpService,
        AuthorizationHttpService,
        BatchClientService,
        BatchLabsService,
        CacheDataService,
        CommandService,
        CommonModule,
        ComputeService,
        ElectronRemote,
        ElectronShell,
        FileService,
        FileSystemService,
        GithubDataService,
        HttpUploadService,
        InsightsMetricsService,
        IpcService,
        JobHookTaskService,
        JobScheduleService,
        JobService,
        LocalFileStorage,
        NavigatorService,
        NcjFileGroupService,
        NcjSubmitService,
        NcjTemplateService,
        NetworkConfigurationService,
        NodeService,
        NodeUserService,
        PinnedEntityService,
        PollService,
        PoolService,
        PricingService,
        QuotaService,
        PythonRpcService,
        ResourceAccessService,
        SettingsService,
        StorageAccountService,
        StorageClientService,
        StorageService,
        SSHKeyService,
        SubscriptionService,
        TaskService,
        ThemeService,
        VmSizeService,
        PredefinedFormulaService,
        ...graphApiServices,
        { provide: ErrorHandler, useClass: BatchLabsErrorHandler },
    ],
})
export class AppModule { }
