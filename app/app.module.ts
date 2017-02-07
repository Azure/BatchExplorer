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
import { AdUserDropdownComponent } from "./components/user";

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
    RerunTaskFormComponent,
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

const modules = [
    PoolDetailsModule, PoolGraphsModule, StartTaskModule,
    JobDetailsModule,
    TaskBaseModule, TaskDetailsModule, TaskBrowseModule,
    NodeBrowseModule,
    FileBrowseModule, FileDetailsModule,
];

@NgModule({
    bootstrap: [
        AppComponent,
    ],
    declarations: [
        AccountCreateDialogComponent,
        AccountDetailsComponent,
        AccountDetailsHomeComponent,
        AccountDropDown,
        RerunTaskFormComponent,
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
        FileHomeComponent,
        JobAdvancedFilterComponent,
        JobCreateBasicDialogComponent,
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
        TaskCreateBasicDialogComponent,
        TaskHomeComponent,
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
        RerunTaskFormComponent,
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
