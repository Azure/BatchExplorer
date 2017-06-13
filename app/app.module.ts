import { HashLocationStrategy, LocationStrategy } from "@angular/common";
import { ErrorHandler, NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MaterialModule } from "@angular/material";
import { BrowserModule } from "@angular/platform-browser";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { RouterModule } from "@angular/router";

// application router
import { routes } from "./app.routes";

// components
import { AppComponent } from "app/app.component";
import { MainNavigationComponent } from "app/components/shared/main-navigation.component";
import { AADUserDropdownComponent } from "app/components/user";

// extenal modules
import { AccountModule } from "app/components/account/account.module";
import { ApplicationModule } from "app/components/application/application.module";
import { BaseModule } from "app/components/base";
import { FileModule } from "app/components/file/file.module";
import { JobModule } from "app/components/job/job.module";
import { NodeModule } from "app/components/node/node.module";
import { PoolModule } from "app/components/pool/pool.module";
import { TaskModule } from "app/components/task/task.module";

// unhandled application error handler
import { BatchLabsErrorHandler } from "app/error-handler";

// services
import {
    AccountService,
    AdalService,
    ApplicationService,
    ArmHttpService,
    AutoscaleFormulaService,
    AzureHttpService,
    BatchClientService,
    CommandService,
    ElectronRemote,
    ElectronShell,
    FileService,
    FileSystemService,
    GithubDataService,
    HttpUploadService,
    JobHookTaskService,
    JobService,
    LocalFileStorage,
    NodeService,
    NodeUserService,
    PoolService,
    PredefinedFormulaService,
    PricingService,
    SSHKeyService,
    SettingsService,
    StorageAccountService,
    StorageClientService,
    StorageService,
    SubscriptionService,
    TaskService,
    VmSizeService,
    commands,
} from "./services";

const modules = [
    AccountModule, ApplicationModule, FileModule, JobModule, NodeModule, PoolModule, TaskModule,
];

@NgModule({
    bootstrap: [
        AppComponent,
    ],
    declarations: [
        AADUserDropdownComponent,
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
        RouterModule.forRoot(routes, { useHash: true }),
        BaseModule,
        ...modules,
    ],
    providers: [
        { provide: LocationStrategy, useClass: HashLocationStrategy },
        AccountService,
        AdalService,
        ApplicationService,
        AutoscaleFormulaService,
        AzureHttpService,
        ArmHttpService,
        BatchClientService,
        CommandService,
        ElectronRemote,
        ElectronShell,
        FileService,
        FileSystemService,
        GithubDataService,
        HttpUploadService,
        JobHookTaskService,
        JobService,
        LocalFileStorage,
        NodeService,
        NodeUserService,
        PoolService,
        PricingService,
        SettingsService,
        StorageAccountService,
        StorageClientService,
        StorageService,
        SSHKeyService,
        SubscriptionService,
        TaskService,
        VmSizeService,
        PredefinedFormulaService,
        { provide: ErrorHandler, useClass: BatchLabsErrorHandler },
        ...commands,
    ],
})

export class AppModule { }
