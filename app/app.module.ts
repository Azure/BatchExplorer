import { HashLocationStrategy, LocationStrategy } from "@angular/common";
import { ErrorHandler, NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MaterialModule } from "@angular/material";
import { BrowserModule } from "@angular/platform-browser";
import { RouterModule } from "@angular/router";

import { routes } from "./app.routes";

// components
import { NodeConnectModule } from "app/components/node/connect";
import { StartTaskModule } from "app/components/pool/start-task";
import { AppComponent } from "./app.component";
import { DeleteAccountDialogComponent } from "./components/account/action/delete-account-dialog.component";
import AccountCreateDialogComponent from "./components/account/add/account-create-dialog.component";
import { AccountBrowseModule } from "./components/account/browse";
import { AccountDetailsHomeComponent } from "./components/account/details/account-details-home.component";
import { AccountDetailsComponent } from "./components/account/details/account-details.component";
import { AccountHomeComponent } from "./components/account/home/account-home.component";
import { ApplicationModule } from "./components/application/application.module";
import { BaseModule } from "./components/base";
import { FileBrowseModule } from "./components/file/browse";
import { FileDetailsModule } from "./components/file/details";
import { FileHomeComponent } from "./components/file/home";
import { JobStatsPreviewComponent } from "./components/job/base/job-stats-preview";
import { JobAdvancedFilterComponent } from "./components/job/browse/filter/job-advanced-filter.component";
import { JobListComponent } from "./components/job/browse/job-list.component";
import { JobDetailsModule } from "./components/job/details";
import { JobHomeComponent } from "./components/job/home/job-home.component";
import { NodeBrowseModule } from "./components/node/browse";
import { NoNodeSelectedComponent, NodeDetailsComponent, NodePropertiesComponent } from "./components/node/details";
import { NodeHomeComponent } from "./components/node/home";
import { PoolNodesPreviewComponent } from "./components/pool/base/pool-nodes-preview.component";
import { PoolAdvancedFilterComponent } from "./components/pool/browse/filter";
import { PoolListComponent } from "./components/pool/browse/pool-list.component";
import { PoolDetailsModule } from "./components/pool/details";
import { PoolGraphsModule } from "./components/pool/graphs";
import { PoolHomeComponent } from "./components/pool/home/pool-home.component";
import { MainNavigationComponent } from "./components/shared/main-navigation.component";
import { TaskBrowseModule } from "./components/task/browse";
import { TaskDetailsModule } from "./components/task/details";
import { TaskHomeComponent } from "./components/task/home";
import { AADUserDropdownComponent } from "./components/user";

// job actions
import { JobActionModule } from "./components/job/action";

// pool actions
import {
    DeletePoolDialogComponent,
    PoolCreateBasicDialogComponent,
    PoolOsPickerComponent,
    PoolResizeDialogComponent,
} from "./components/pool/action";

// task actions
import {
    DeleteTaskDialogComponent,
    RerunTaskFormComponent,
    TaskCreateBasicDialogComponent,
    TerminateTaskDialogComponent,
} from "./components/task/action";
import { TaskBaseModule } from "./components/task/base";

// services
import { BatchLabsErrorHandler } from "app/error-handler";
import {
    AccountService,
    AdalService,
    ApplicationService,
    ArmHttpService,
    AzureHttpService,
    BatchClientService,
    CommandService,
    ElectronRemote,
    ElectronShell,
    FileService,
    FileSystemService,
    HttpUploadService,
    JobService,
    NodeService,
    NodeUserService,
    PoolService,
    SSHKeyService,
    SettingsService,
    SubscriptionService,
    TaskService,
    commands,
} from "./services";

const modules = [
    AccountBrowseModule,
    ApplicationModule,
    PoolDetailsModule, PoolGraphsModule, StartTaskModule,
    JobDetailsModule, JobActionModule,
    TaskBaseModule, TaskDetailsModule, TaskBrowseModule,
    NodeBrowseModule, NodeConnectModule,
    FileBrowseModule, FileDetailsModule,
];

@NgModule({
    bootstrap: [
        AppComponent,
    ],
    declarations: [
        AADUserDropdownComponent,
        AccountCreateDialogComponent,
        AccountDetailsComponent,
        AccountDetailsHomeComponent,
        AccountHomeComponent,
        AppComponent,
        DeleteAccountDialogComponent,
        DeletePoolDialogComponent,
        DeleteTaskDialogComponent,
        FileHomeComponent,
        JobAdvancedFilterComponent,
        JobHomeComponent,
        JobListComponent,
        JobStatsPreviewComponent,
        MainNavigationComponent,
        NodeDetailsComponent,
        NodePropertiesComponent,
        NodeHomeComponent,
        NoNodeSelectedComponent,
        PoolAdvancedFilterComponent,
        PoolCreateBasicDialogComponent,
        PoolHomeComponent,
        PoolListComponent,
        PoolNodesPreviewComponent,
        PoolOsPickerComponent,
        PoolResizeDialogComponent,
        RerunTaskFormComponent,
        TaskCreateBasicDialogComponent,
        TaskHomeComponent,
        TerminateTaskDialogComponent,
    ],
    entryComponents: [
        AccountCreateDialogComponent,
        DeleteAccountDialogComponent,
        DeletePoolDialogComponent,
        DeleteTaskDialogComponent,
        PoolCreateBasicDialogComponent,
        PoolResizeDialogComponent,
        RerunTaskFormComponent,
        TaskCreateBasicDialogComponent,
        TerminateTaskDialogComponent,
    ],
    imports: [
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
        AzureHttpService,
        ArmHttpService,
        CommandService,
        ElectronRemote,
        ElectronShell,
        FileService,
        FileSystemService,
        HttpUploadService,
        JobService,
        PoolService,
        SubscriptionService,
        SSHKeyService,
        NodeService,
        NodeUserService,
        BatchClientService,
        SettingsService,
        TaskService,
        { provide: ErrorHandler, useClass: BatchLabsErrorHandler },
        ...commands,
    ],
})

export class AppModule { }
