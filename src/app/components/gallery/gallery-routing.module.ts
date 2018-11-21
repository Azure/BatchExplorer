import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { GalleryComponent } from "./home";
import { LocalTemplateExplorerComponent } from "./local-template-explorer";
import { SubmitRecentTemplateComponent } from "./submit-recent-template";

const routes: Routes = [
    {
        path: "",
        component: GalleryComponent,
    },
    {
        path: ":portfolioId/:applicationId",
        component: GalleryComponent,
    },
    {
        path: ":portfolioId/:applicationId/:actionId/submit",
        component: GalleryComponent,
    },
    {
        path: "local",
        component: LocalTemplateExplorerComponent,
    },
    {
        path: "recent/:id",
        component: SubmitRecentTemplateComponent,
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class GalleryRoutingModule {

}
