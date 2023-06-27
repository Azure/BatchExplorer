import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { ApplicationDefaultComponent, ApplicationDetailsComponent } from "./details";
import { ApplicationHomeComponent } from "./home";

const routes: Routes = [
    {
        path: "",
        component: ApplicationHomeComponent,
        children: [
            { path: "", component: ApplicationDefaultComponent }, // applications/
            { path: ":id", component: ApplicationDetailsComponent }, // applications/{application.id}
        ],
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class BatchApplicationRoutingModule {

}
