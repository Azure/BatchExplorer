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
import { AccountModule } from "app/components/account/account.module";
import { ApplicationModule } from "app/components/application/application.module";
import { BaseModule } from "app/components/base";
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
import { LayoutModule } from "app/components/layout";
import { MaterialModule } from "app/core";
import { PollService } from "app/services/core";
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
    JobHookTaskService,
    JobScheduleService,
    JobService,
    LocalFileStorage,
    MonacoLoader,
    NavigatorService,
    NcjFileGroupService,
    NcjSubmitService,
    NcjTemplateService,
    NodeService,
    NodeUserService,
    PinnedEntityService,
    PoolService,
    PredefinedFormulaService,
    PricingService,
    PythonRpcService,
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
];

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
        JobHookTaskService,
        JobScheduleService,
        JobService,
        LocalFileStorage,
        MonacoLoader,
        NavigatorService,
        NcjFileGroupService,
        NcjSubmitService,
        NcjTemplateService,
        NodeService,
        NodeUserService,
        PinnedEntityService,
        PollService,
        PoolService,
        PricingService,
        PythonRpcService,
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
        { provide: ErrorHandler, useClass: BatchLabsErrorHandler },
    ],
})
export class AppModule { }
