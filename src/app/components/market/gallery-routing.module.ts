import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { MarketComponent } from "./home";
import { LocalTemplateExplorerComponent } from "./local-template-explorer";
import { SubmitRecentTemplateComponent } from "./submit-recent-template";

const routes: Routes = [
    {
        path: "local",
        component: LocalTemplateExplorerComponent,
    },
    {
        path: "recent/:id",
        component: SubmitRecentTemplateComponent,
    },
    {
        path: ":portfolioId/:applicationId",
        component: MarketComponent,
    },
    {
        path: ":portfolioId/:applicationId/:actionId/submit",
        component: MarketComponent,
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class GalleryRoutingModule {

}
