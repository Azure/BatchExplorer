import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { GalleryComponent } from "./home";
import { LocalTemplateExplorerComponent } from "./local-template-explorer";

const routes: Routes = [
    {
        path: "",
        component: GalleryComponent,
    },
    {
        path: "local",
        component: LocalTemplateExplorerComponent,
    },
    {
        path: ":portfolioId/:applicationId",
        component: GalleryComponent,
    },
    {
        path: ":portfolioId/:applicationId/:actionId/submit",
        component: GalleryComponent,
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class GalleryRoutingModule {

}
