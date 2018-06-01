import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { ButtonsModule } from "@batch-flask/ui/buttons";
import { BreadcrumbComponent } from "./breadcrumb";
import { BreadcrumbGroupComponent } from "./breadcrumb-group";
import { BreadcrumbLinkDirective } from "./breadcrumb-link.directive";
import { BreadcrumbService } from "./breadcrumb.service";

const components = [BreadcrumbGroupComponent, BreadcrumbLinkDirective];
const internalComponents = [BreadcrumbComponent];

@NgModule({
    declarations: [...components, ...internalComponents],
    exports: components,
    providers: [BreadcrumbService],
    imports: [BrowserModule, ButtonsModule],
})
export class BreadcrumbModule {

}
