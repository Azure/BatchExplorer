import { NgModule } from "@angular/core";

import { commonModules } from "app/common";
import { ApplicationListComponent } from "./browse/application-list.component";
import { ApplicationDetailsHomeComponent } from "./details/application-details-home.component";
import { ApplicationDetailsComponent } from "./details/application-details.component";
import { ApplicationHomeComponent } from "./home/application-home.component";


const components = [ApplicationDetailsHomeComponent, ApplicationDetailsComponent, ApplicationHomeComponent,
    ApplicationListComponent];

@NgModule({
    declarations: components,
    exports: components,
    imports: [...commonModules ],
})
export class ApplicationModule {
}
