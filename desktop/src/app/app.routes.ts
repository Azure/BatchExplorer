import { Routes } from "@angular/router";
import { KeyBindingsComponent } from "@batch-flask/ui";
import { ActivityMonitorComponent } from "@batch-flask/ui/activity/activity-monitor";
import { RequireActiveBatchAccountGuard } from "app/components/common/guards";
import { ThemeColorsComponent } from "app/components/misc/theme-colors";
import { PoolStandaloneGraphsComponent } from "app/components/pool/graphs/standalone";
import { AuthSettingsComponent, SettingsComponent } from "app/components/settings";
import { AccountDefaultComponent, AccountDetailsComponent } from "./components/account/details";
import { AccountHomeComponent } from "./components/account/home/account-home.component";
import { AccountMonitoringHomeComponent } from "./components/account/monitoring";
import { PlaygroundRouteComponent } from "./components/misc/playground-route";
import { WelcomeComponent } from "./components/welcome";


export const routes: Routes = [
    { path: "", redirectTo: "welcome", pathMatch: "full" },
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
        component: AuthSettingsComponent,
        path: "auth-settings",
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
        canActivate: [RequireActiveBatchAccountGuard],
        loadChildren: () => import("./components/job/job.module").then(m => m.JobModule),
    },
    {
        path: "jobschedules",
        canActivate: [RequireActiveBatchAccountGuard],
        loadChildren: () => import("./components/job-schedule/job-schedule.module").then(m => m.JobScheduleModule),
    },
    {
        path: "pools",
        canActivate: [RequireActiveBatchAccountGuard],
        loadChildren: () => import("./components/pool/pool.module").then(m => m.PoolModule),
    },
    {
        path: "certificates",
        canActivate: [RequireActiveBatchAccountGuard],
        loadChildren: () => import("./components/certificate/certificate.module").then(m => m.CertificateModule),
    },
    {
        path: "applications",
        canActivate: [RequireActiveBatchAccountGuard],
        loadChildren: () => import("./components/application/application.module").then(m => m.ApplicationModule),
    },
    {
        path: "data",
        canActivate: [RequireActiveBatchAccountGuard],
        loadChildren: () => import("./components/data/data.module").then(m => m.DataModule),
    },
    {
        path: "pools/:poolId/nodes",
        loadChildren: () => import("./components/node/node.module").then(m => m.NodeModule),
    },
    {
        path: "jobs/:jobId/tasks",
        loadChildren: () => import("./components/task/task.module").then(m => m.TaskModule),
    },
    {
        path: "theme/colors",
        component: ThemeColorsComponent,
    },
    {
        path: "playground",
        component:  PlaygroundRouteComponent,
    },
    {
        path: "playground/:component",
        component:  PlaygroundRouteComponent,
    },
    {
        path: "standalone/pools/:poolId/graphs",
        component: PoolStandaloneGraphsComponent,
    },
    {
        path: "keybindings",
        component: KeyBindingsComponent,
    },
    {
        path: "welcome",
        component: WelcomeComponent,
    }
];
