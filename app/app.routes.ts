// tslint:disable: object-literal-sort-keys
import { Routes } from "@angular/router";

<<<<<<< HEAD
import { ChooseActionComponent } from "app/components/market/application-action";
=======
import { JobGraphsComponent } from "app/components/job/graphs/job-graphs-home";
>>>>>>> b1fa56d1f7ac0364a7ed6eca24e91ffb8e6f5e15
import { Constants } from "app/utils";
import { AccountDefaultComponent, AccountDetailsComponent } from "./components/account/details";
import { AccountHomeComponent } from "./components/account/home/account-home.component";
import { ApplicationDefaultComponent, ApplicationDetailsComponent } from "./components/application/details";
import { ApplicationHomeComponent } from "./components/application/home/application-home.component";
import { DataDefaultComponent, DataDetailsComponent } from "./components/data/details";
import { DataHomeComponent } from "./components/data/home/data-home.component";
import { FileDetailsComponent } from "./components/file/details/file-details.component";
import { FileHomeComponent } from "./components/file/home";
import { JobDefaultComponent, JobDetailsComponent } from "./components/job/details";
import { JobHomeComponent } from "./components/job/home/job-home.component";
import { MarketComponent } from "./components/market/home";
import { SubmitMarketApplicationComponent } from "./components/market/submit";
import { NodeDefaultComponent, NodeDetailsComponent } from "./components/node/details";
import { NodeHomeComponent } from "./components/node/home";
import { PoolDetailsComponent } from "./components/pool/details";
import { PoolDefaultComponent } from "./components/pool/details";
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
        ],
    },
    {
        path: "jobs",
        component: JobHomeComponent,
        children: [
            { path: "", component: JobDefaultComponent }, // jobs/
            { path: ":id", component: JobDetailsComponent }, // jobs/{job.id}
        ],
    },
    {
        path: "pools",
        component: PoolHomeComponent,
        children: [
            { path: "", component: PoolDefaultComponent }, // pools/
            { path: ":id", component: PoolDetailsComponent }, // pools/{pool.id}
        ],
    },
    {
        path: "market",
        component: MarketComponent,
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
        component: ApplicationHomeComponent,
        children: [
            { path: "", component: ApplicationDefaultComponent }, // applications/
            { path: ":id", component: ApplicationDetailsComponent }, // applications/{application.id}
        ],
    },
    {
        path: "data",
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
        path: "pools/:poolId/nodes/:nodeId/files/:filename",
        component: FileHomeComponent,
        data: { type: Constants.FileSourceTypes.Pool },
        children: [
            { path: "", component: FileDetailsComponent },
        ],
    },
    {
        path: "jobs/:jobId/tasks/:taskId/files/:filename",
        component: FileHomeComponent,
        data: { type: Constants.FileSourceTypes.Job },
        children: [
            { path: "", component: FileDetailsComponent },
        ],
    },
    {
        path: "jobs/:jobId/tasks/:taskId/:outputKind/blobs/:filename",
        component: FileHomeComponent,
        data: { type: Constants.FileSourceTypes.Blob },
        children: [
            { path: "", component: FileDetailsComponent },
        ],
    },
    {
        path: "data/:container/blobs/:filename",
        component: FileHomeComponent,
        data: { type: Constants.FileSourceTypes.Blob },
        children: [
            { path: "", component: FileDetailsComponent },
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
