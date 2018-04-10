// tslint:disable: object-literal-sort-keys
import { Routes } from "@angular/router";

import { NavigationGuard } from "app/components/common/guards";
import { JobGraphsComponent } from "app/components/job/graphs/job-graphs-home";
import { ChooseActionComponent } from "app/components/market/application-action";
import { LocalTemplateBrowserComponent } from "app/components/market/local-template-browser";
import { SubmitLocalTemplateComponent } from "app/components/market/submit-local-template";
import { SubmitRecentTemplateComponent } from "app/components/market/submit-recent-template";
import { ThemeColorsComponent } from "app/components/misc";
import { PoolStandaloneGraphsComponent } from "app/components/pool/graphs/standalone";
import { SettingsComponent } from "app/components/settings";
import { AccountDefaultComponent, AccountDetailsComponent } from "./components/account/details";
import { AccountHomeComponent } from "./components/account/home/account-home.component";
import { AccountMonitoringHomeComponent } from "./components/account/monitoring";
import { ApplicationDefaultComponent, ApplicationDetailsComponent } from "./components/application/details";
import { ApplicationHomeComponent } from "./components/application/home/application-home.component";
import { CertificateDefaultComponent, CertificateDetailsComponent } from "./components/certificate/details";
import { CertificateHomeComponent } from "./components/certificate/home/certificate-home.component";
import { DataDefaultComponent, DataDetailsComponent } from "./components/data/details";
import { DataHomeComponent } from "./components/data/home/data-home.component";
import { JobScheduleDefaultComponent, JobScheduleDetailsComponent } from "./components/job-schedule/details";
import { JobScheduleHomeComponent } from "./components/job-schedule/home/job-schedule-home.component";
import { JobDefaultComponent, JobDetailsComponent } from "./components/job/details";
import { JobHomeComponent } from "./components/job/home/job-home.component";
import { MarketComponent } from "./components/market/home";
import { SubmitMarketApplicationComponent } from "./components/market/submit";
import { NodeDefaultComponent, NodeDetailsComponent } from "./components/node/details";
import { NodeHomeComponent } from "./components/node/home";
import { PoolDefaultComponent, PoolDetailsComponent } from "./components/pool/details";
import { PoolHomeComponent } from "./components/pool/home/pool-home.component";
import { TaskDefaultComponent, TaskDetailsComponent } from "./components/task/details";
import { TaskHomeComponent } from "./components/task/home";

// set up the routing table
export const routes: Routes = [
    { path: "", redirectTo: "accounts", pathMatch: "full" },
    {
        component: AccountHomeComponent,
        path: "accounts",
        children: [
            { path: "", component: AccountDefaultComponent }, // accounts/
            { path: ":id", component: AccountDetailsComponent }, // accounts/{account.id}
            { path: ":id/monitor", component: AccountMonitoringHomeComponent }, // accounts/{account.id}
        ],
    },
    {
        component: SettingsComponent,
        path: "settings",
    },
    {
        path: "jobs",
        canActivate: [NavigationGuard],
        component: JobHomeComponent,
        children: [
            { path: "", component: JobDefaultComponent }, // jobs/
            { path: ":id", component: JobDetailsComponent }, // jobs/{job.id}
        ],
    },
    {
        path: "jobschedules",
        canActivate: [NavigationGuard],
        component: JobScheduleHomeComponent,
        children: [
            { path: "", component: JobScheduleDefaultComponent }, // jobschedules/
            { path: ":id", component: JobScheduleDetailsComponent }, // jobschedules/{jobschedule.id}
        ],
    },
    {
        path: "pools",
        canActivate: [NavigationGuard],
        component: PoolHomeComponent,
        children: [
            { path: "", component: PoolDefaultComponent }, // pools/
            { path: ":id", component: PoolDetailsComponent }, // pools/{pool.id}
        ],
    },
    {
        path: "certificates",
        canActivate: [NavigationGuard],
        component: CertificateHomeComponent,
        children: [
            { path: "", component: CertificateDefaultComponent }, // certificates/
            { path: ":thumbprint", component: CertificateDetailsComponent }, // certificate/{certificate.thumbprint}
        ],
    },
    {
        path: "market",
        canActivate: [NavigationGuard],
        component: MarketComponent,
    },
    {
        path: "market/local",
        component: LocalTemplateBrowserComponent,
    },
    {
        path: "market/local/submit",
        component: SubmitLocalTemplateComponent,
    },
    {
        path: "market/recent/:id",
        component: SubmitRecentTemplateComponent,
    },
    {
        path: "market/:applicationId/actions",
        component: ChooseActionComponent,
    },
    {
        path: "market/:applicationId/actions/:actionId/submit",
        component: SubmitMarketApplicationComponent,
    },
    {
        path: "applications",
        canActivate: [NavigationGuard],
        component: ApplicationHomeComponent,
        children: [
            { path: "", component: ApplicationDefaultComponent }, // applications/
            { path: ":id", component: ApplicationDetailsComponent }, // applications/{application.id}
        ],
    },
    {
        path: "data",
        component: DataHomeComponent,
    },
    {
        path: "data/:dataSource/containers",
        canActivate: [NavigationGuard],
        component: DataHomeComponent,
        children: [
            { path: "", component: DataDefaultComponent }, // data/
            { path: ":id", component: DataDetailsComponent }, // data/{file-group.id}
        ],
    },
    {
        path: "pools/:poolId/nodes",
        component: NodeHomeComponent,
        children: [
            { path: "", component: NodeDefaultComponent }, // pools/{pool.id}/nodes
            { path: ":id", component: NodeDetailsComponent }, // pools/{pool.id}/nodes/{node.id}
        ],
    },
    {
        path: "jobs/:jobId/tasks",
        component: TaskHomeComponent,
        children: [
            { path: "", component: TaskDefaultComponent }, // jobs/{job.id}/tasks
            { path: ":id", component: TaskDetailsComponent }, // jobs/{job.id}/tasks/{task.id}
        ],
    },
    {
        path: "jobs/:jobId/graphs",
        component: JobGraphsComponent,
    },
    {
        path: "theme/colors",
        component: ThemeColorsComponent,
    },
    {
        path: "standalone/pools/:poolId/graphs",
        component: PoolStandaloneGraphsComponent,
    },
];
