import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";

import { BreadcrumbLinkDirective } from "./breadcrumb-link.directive";
import { BreadcrumbService } from "./breadcrumb.service";
import { BreadcrumbsComponent, CrumbComponent } from "./breadcrumbs.component";

const components = [BreadcrumbsComponent, BreadcrumbLinkDirective, CrumbComponent];
@NgModule({
    declarations: components,
    exports: components,
    providers: [BreadcrumbService],
    imports: [BrowserModule],
})
export class BreadcrumbModule {

}
