import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { NodeDefaultComponent, NodeDetailsComponent } from "./details";
import { NodeHomeComponent } from "./home";

const routes: Routes = [
    {
        path: "",
        component: NodeHomeComponent,
        children: [
            { path: "", component: NodeDefaultComponent }, // pools/{pool.id}/nodes
            { path: ":id", component: NodeDetailsComponent }, // pools/{pool.id}/nodes/{node.id}
        ],
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class ComputeNodeRoutingModule {

}
