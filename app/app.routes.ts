// tslint:disable: object-literal-sort-keys
import { Routes } from "@angular/router";

// component imports for routing
import { AccountDetailsHomeComponent } from "./components/account/details/account-details-home.component";
import { AccountDetailsComponent } from "./components/account/details/account-details.component";
import { AccountHomeComponent } from "./components/account/home/account-home.component";
import { JobDetailsHomeComponent } from "./components/job/details/job-details-home.component";
import { JobDetailsComponent } from "./components/job/details/job-details.component";
import { JobHomeComponent } from "./components/job/home/job-home.component";
import { NoNodeSelectedComponent, NodeDetailsComponent } from "./components/node/details";
import { NodeHomeComponent } from "./components/node/home";
import { PoolDetailsComponent } from "./components/pool/details/pool-details.component";
import { PoolDetailsHomeComponent } from "./components/pool/details/pool.details.home";
import { PoolHomeComponent } from "./components/pool/home/pool-home.component";
import { NoTaskSelectedComponent, TaskDetailsComponent } from "./components/task/details";
import { TaskHomeComponent } from "./components/task/home";

// set up the routing table
export const routes: Routes = [
    { path: "", redirectTo: "accounts", pathMatch: "full" },
    {
        component: AccountHomeComponent,
        path: "accounts",
        children: [
            { path: "", component: AccountDetailsHomeComponent }, // accounts/
            { path: ":id", component: AccountDetailsComponent }, // accounts/{account.id}
        ],
    },
    {
        path: "jobs",
        component: JobHomeComponent,
        children: [
            { path: "", component: JobDetailsHomeComponent }, // jobs/
            { path: ":id", component: JobDetailsComponent }, // jobs/{job.id}
        ],
    },
    {
        path: "pools",
        component: PoolHomeComponent,
        children: [
            { path: "", component: PoolDetailsHomeComponent }, // pools/
            { path: ":id", component: PoolDetailsComponent }, // pools/{pool.id}
        ],
    },
    {
        path: "pools/:poolId/nodes",
        component: NodeHomeComponent,
        children: [
            { path: "", component: NoNodeSelectedComponent }, // pools/{pool.id}/nodes
            { path: ":id", component: NodeDetailsComponent }, // pools/{pool.id}/nodes/{node.id}
        ],
    },
    {
        path: "jobs/:jobId/tasks",
        component: TaskHomeComponent,
        children: [
            { path: "", component: NoTaskSelectedComponent }, // jobs/{job.id}/tasks
            { path: ":id", component: TaskDetailsComponent }, // jobs/{job.id}/tasks/{task.id}
        ],
    },
];

// todo: copied here for reference only, delete when done.
// export interface Route {
//     path?: string;
//     pathMatch?: string;
//     component?: Type<any>;
//     redirectTo?: string;
//     outlet?: string;
//     canActivate?: any[];
//     canActivateChild?: any[];
//     canDeactivate?: any[];
//     canLoad?: any[];
//     data?: Data;
//     resolve?: ResolveData;
//     children?: Route[];
//     loadChildren?: LoadChildren;
// }
