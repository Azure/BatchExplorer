import { Routes } from "@angular/router";

import { ActivityMonitorComponent } from "@batch-flask/ui/activity/activity-monitor";
import { NavigationGuard } from "app/components/common/guards";
import { ThemeColorsComponent } from "app/components/misc";
import { PoolStandaloneGraphsComponent } from "app/components/pool/graphs/standalone";
import { SettingsComponent } from "app/components/settings";
import { AccountDefaultComponent, AccountDetailsComponent } from "./components/account/details";
import { AccountHomeComponent } from "./components/account/home/account-home.component";
import { AccountMonitoringHomeComponent } from "./components/account/monitoring";

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
        loadChildren: "./components/job-schedule/job-schedule.module#JobScheduleModule",
    },
    {
        path: "pools",
        canActivate: [NavigationGuard],
        loadChildren: "./components/pool/pool.module#PoolModule",
    },
    {
        path: "certificates",
        canActivate: [NavigationGuard],
        loadChildren: "./components/certificate/certificate.module#CertificateModule",
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
        loadChildren: "./components/application/application.module#ApplicationModule",
    },
    {
        path: "data",
        canActivate: [NavigationGuard],
        loadChildren: "./components/data/data.module#DataModule",
    },
    {
        path: "pools/:poolId/nodes",
        loadChildren: "./components/node/node.module#NodeModule",
    },
    {
        path: "jobs/:jobId/tasks",
        loadChildren: "./components/task/task.module#TaskModule",
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
