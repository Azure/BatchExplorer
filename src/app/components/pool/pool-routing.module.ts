import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { PoolDefaultComponent, PoolDetailsComponent } from "./details";
import { PoolHomeComponent } from "./home/pool-home.component";

const routes: Routes = [
    {
        path: "",
        component: PoolHomeComponent,
        children: [
            { path: "", component: PoolDefaultComponent }, // pools/
            { path: ":id", component: PoolDetailsComponent }, // pools/{pool.id}
        ],
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class PoolRoutingModule {

}
