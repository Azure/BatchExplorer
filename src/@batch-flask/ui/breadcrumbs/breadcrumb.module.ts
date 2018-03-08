import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";

import { BreadcrumbGroupComponent } from "./breadcrumb-group.component";
import { BreadcrumbLinkDirective } from "./breadcrumb-link.directive";
import { BreadcrumbComponent } from "./breadcrumb.component";
import { BreadcrumbService } from "./breadcrumb.service";

const components = [BreadcrumbGroupComponent, BreadcrumbLinkDirective];
const internalComponents = [BreadcrumbComponent];

@NgModule({
    declarations: [...components, ...internalComponents],
    exports: components,
    providers: [BreadcrumbService],
    imports: [BrowserModule],
})
export class BreadcrumbModule {

}
