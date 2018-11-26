import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { JobDefaultComponent, JobDetailsComponent } from "./details";
import { JobHomeComponent } from "./home/job-home.component";

const routes: Routes = [
    {
        path: "",
        component: JobHomeComponent,
        children: [
            { path: "", component: JobDefaultComponent }, // jobs/
            { path: ":id", component: JobDetailsComponent }, // jobs/{job.id}
        ],
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class JobRoutingModule {

}
