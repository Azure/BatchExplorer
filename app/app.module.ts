import { HashLocationStrategy, LocationStrategy } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MaterialModule } from "@angular/material";
import { BrowserModule } from "@angular/platform-browser";
import { RouterModule } from "@angular/router";

import { routes } from "./app.routes";

// components
import { StartTaskModule } from "app/components/pool/start-task";
import { AppComponent } from "./app.component";
import { DeleteAccountDialogComponent } from "./components/account/action/delete-account-dialog.component";
import AccountCreateDialogComponent from "./components/account/add/account-create-dialog.component";
import { AccountFavListComponent, AccountListComponent } from "./components/account/browse";
import AccountDropDown from "./components/account/browse/account-dropdown.component";
import { AccountDetailsHomeComponent } from "./components/account/details/account-details-home.component";
import { AccountDetailsComponent } from "./components/account/details/account-details.component";
import { AccountHomeComponent } from "./components/account/home/account-home.component";
import { BaseModule } from "./components/base";
import { FileDirectoryFilter, FileListDisplayComponent } from "./components/file/browse/display";
import { FileListComponent } from "./components/file/browse/file-list.component";
import { FileContentComponent } from "./components/file/details";
import { JobStatsPreviewComponent } from "./components/job/base/job-stats-preview";
import { JobAdvancedFilterComponent } from "./components/job/browse/filter/job-advanced-filter.component";
import { JobListComponent } from "./components/job/browse/job-list.component";
import { JobDetailsHomeComponent } from "./components/job/details/job-details-home.component";
import { JobDetailsComponent } from "./components/job/details/job-details.component";
import { JobEnvironmentSettingsComponent } from "./components/job/details/job-env-settings.component";
import { JobMetadataComponent } from "./components/job/details/job-metadata.component";
import { JobPropertiesComponent } from "./components/job/details/job-properties.component";
import { JobHomeComponent } from "./components/job/home/job-home.component";
import { NodeListDisplayComponent } from "./components/node/browse/display";
import { NodeAdvancedFilterComponent } from "./components/node/browse/filter";
import { NodeListComponent } from "./components/node/browse/node.list.component";
import { NoNodeSelectedComponent, NodeDetailsComponent, NodePropertiesComponent } from "./components/node/details";
import { NodeHomeComponent } from "./components/node/home";
import { PoolNodesPreviewComponent } from "./components/pool/base/pool-nodes-preview.component";
import { PoolAdvancedFilterComponent } from "./components/pool/browse/filter";
import { PoolListComponent } from "./components/pool/browse/pool-list.component";
import {
    PoolDetailsComponent,
    PoolDetailsHomeComponent,
    PoolPropertiesComponent,
} from "./components/pool/details";
import { PoolGraphsModule } from "./components/pool/graphs";
import { PoolHomeComponent } from "./components/pool/home/pool-home.component";
import { MainNavigationComponent } from "./components/shared/main-navigation.component";
import { TaskListDisplayComponent } from "./components/task/browse/display";
import { TaskAdvancedFilterComponent } from "./components/task/browse/filter";
import { TaskPreviewComponent } from "./components/task/browse/preview/task-preview.component";
import { TaskListComponent } from "./components/task/browse/task-list.component";
import { TaskHomeComponent } from "./components/task/home";
import { AdUserDropdownComponent } from "./components/user";

import {
    NoTaskSelectedComponent,
    TaskDependenciesComponent,
    TaskDetailsComponent,
    TaskEnvironmentSettingsComponent,
    TaskPropertiesComponent,
    TaskResourceFilesComponent,
    TaskSubTasksTabComponent,
} from "./components/task/details";

import {
    SubTaskDisplayListComponent,
    SubTaskPropertiesComponent,
} from "./components/task/details/sub-tasks";

// job actions
import {
    DeleteJobDialogComponent,
    DisableJobDialogComponent,
    EnableJobDialogComponent,
    JobCreateBasicDialogComponent,
    TerminateJobDialogComponent,
} from "./components/job/action";

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
    TaskCreateBasicDialogComponent,
    TerminateTaskDialogComponent,
} from "./components/task/action";
import { TaskBaseModule } from "./components/task/base";

// services
import {
    AccountService,
    AdalService,
    AzureHttpService,
    CommandService,
    FileService,
    JobService,
    NodeService,
    PoolService,
    SettingsService,
    SubscriptionService,
    TaskService,
    commands,
} from "./services";

const modules = [PoolGraphsModule, StartTaskModule, TaskBaseModule];

@NgModule({
    bootstrap: [
        AppComponent,
    ],
    declarations: [
        AccountCreateDialogComponent,
        AccountDetailsComponent,
        AccountDetailsHomeComponent,
        AccountDropDown,
        AccountHomeComponent,
        AccountFavListComponent,
        AccountListComponent,
        AdUserDropdownComponent,
        AppComponent,
        DeleteAccountDialogComponent,
        DeleteJobDialogComponent,
        DeletePoolDialogComponent,
        DeleteTaskDialogComponent,
        DisableJobDialogComponent,
        EnableJobDialogComponent,
        FileDirectoryFilter,
        FileListComponent,
        FileListDisplayComponent,
        FileContentComponent,
        JobAdvancedFilterComponent,
        JobCreateBasicDialogComponent,
        JobDetailsComponent,
        JobDetailsHomeComponent,
        JobEnvironmentSettingsComponent,
        JobHomeComponent,
        JobListComponent,
        JobMetadataComponent,
        JobPropertiesComponent,
        JobStatsPreviewComponent,
        MainNavigationComponent,
        NodeAdvancedFilterComponent,
        NodeListComponent,
        NodeListDisplayComponent,
        NodeDetailsComponent,
        NodePropertiesComponent,
        NodeHomeComponent,
        NoNodeSelectedComponent,
        NoTaskSelectedComponent,
        PoolAdvancedFilterComponent,
        PoolCreateBasicDialogComponent,
        PoolDetailsComponent,
        PoolDetailsHomeComponent,
        PoolHomeComponent,
        PoolListComponent,
        PoolNodesPreviewComponent,
        PoolOsPickerComponent,
        PoolPropertiesComponent,
        PoolResizeDialogComponent,
        SubTaskDisplayListComponent,
        SubTaskPropertiesComponent,
        TaskAdvancedFilterComponent,
        TaskCreateBasicDialogComponent,
        TaskDependenciesComponent,
        TaskDetailsComponent,
        TaskEnvironmentSettingsComponent,
        TaskHomeComponent,
        TaskListComponent,
        TaskListDisplayComponent,
        TaskPreviewComponent,
        TaskPropertiesComponent,
        TaskResourceFilesComponent,
        TaskSubTasksTabComponent,
        TerminateJobDialogComponent,
        TerminateTaskDialogComponent,
    ],
    entryComponents: [
        AccountCreateDialogComponent,
        DeleteAccountDialogComponent,
        DeleteJobDialogComponent,
        DeletePoolDialogComponent,
        DeleteTaskDialogComponent,
        DisableJobDialogComponent,
        EnableJobDialogComponent,
        JobCreateBasicDialogComponent,
        PoolCreateBasicDialogComponent,
        PoolResizeDialogComponent,
        TaskCreateBasicDialogComponent,
        TerminateJobDialogComponent,
        TerminateTaskDialogComponent,
    ],
    imports: [
        BrowserModule,
        FormsModule,
        MaterialModule.forRoot(),
        ReactiveFormsModule,
        RouterModule.forRoot(routes, { useHash: true }),
        BaseModule.forRoot(),
        ...modules,
    ],
    providers: [
        { provide: LocationStrategy, useClass: HashLocationStrategy },
        AccountService,
        AdalService,
        AzureHttpService,
        CommandService,
        FileService,
        JobService,
        PoolService,
        SubscriptionService,
        NodeService,
        SettingsService,
        TaskService,
        ...commands,
    ],
})

export class AppModule { }
