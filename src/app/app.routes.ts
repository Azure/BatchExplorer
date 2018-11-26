import { Routes } from "@angular/router";

import { ActivityMonitorComponent } from "@batch-flask/ui/activity/activity-monitor";
import { NavigationGuard } from "app/components/common/guards";
import { JobGraphsComponent } from "app/components/job/graphs/job-graphs-home";
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
        component: ActivityMonitorComponent,
        path: "activitymonitor",
    },
    {
        component: ActivityMonitorComponent,
        path: "activitymonitor/:id",
    },
    {
        path: "jobs",
        canActivate: [NavigationGuard],
        loadChildren: "./components/job/job.module#JobModule",
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
    // Redirect for old Gallery URL not to break plugins using it
    {
        path: "market",
        redirectTo: "gallery",
        pathMatch: "full",
    },
    {
        path: "market/:applicationId/actions",
        redirectTo: "gallery/microsoft-offical/:applicationId",
        pathMatch: "full",
    },
    {
        path: "market/:applicationId/actions/:actionId/submit",
        redirectTo: "gallery/microsoft-offical/:applicationId/:actionId/submit",
    },
    {
        path: "gallery",
        canActivate: [NavigationGuard],
        loadChildren: "./components/gallery/gallery.module#GalleryModule",
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
        loadChildren: "./components/node/node.module#NodeModule",
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
