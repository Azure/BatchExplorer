import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { JobScheduleDefaultComponent, JobScheduleDetailsComponent } from "./details";
import { JobScheduleHomeComponent } from "./home/job-schedule-home.component";

const routes: Routes = [
    {
        path: "",
        component: JobScheduleHomeComponent,
        children: [
            { path: "", component: JobScheduleDefaultComponent }, // jobschedules/
            { path: ":id", component: JobScheduleDetailsComponent }, // jobschedules/{jobschedule.id}
        ],
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class JobScheduleRoutingModule {

}
