import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { DataDefaultComponent, DataDetailsComponent } from "./details";
import { DataHomeComponent } from "./home";

const routes: Routes = [
    {
        path: "",
        component: DataHomeComponent,
        children: [
            { path: "", component: DataDefaultComponent }, // data/
            { path: ":id", component: DataDetailsComponent }, // data/{file-group.id}
        ],
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class JobScheduleRoutingModule {

}
