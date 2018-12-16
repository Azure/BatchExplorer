import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { TaskDefaultComponent, TaskDetailsComponent } from "./details";
import { TaskHomeComponent } from "./home";

const routes: Routes = [
    {
        path: "",
        component: TaskHomeComponent,
        children: [
            { path: "", component: TaskDefaultComponent }, // jobs/{job.id}/tasks
            { path: ":id", component: TaskDetailsComponent }, // jobs/{job.id}/tasks/{task.id}
        ],
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class TaskRoutingModule {

}
