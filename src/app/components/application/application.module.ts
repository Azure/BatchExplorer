import { NgModule } from "@angular/core";

import { commonModules } from "app/common";
import { ApplicationCreateDialogComponent, ApplicationEditDialogComponent,
} from "./action";
import { BatchApplicationRoutingModule } from "./batch-application-routing.module";
import { ApplicationListComponent, ApplicationPreviewComponent } from "./browse";
import { ApplicationConfigurationComponent, ApplicationDefaultComponent , ApplicationDetailsComponent,
    ApplicationPackageTableComponent, ApplicationPackagesComponent,
} from "./details";
import { ApplicationErrorDisplayComponent } from "./errors";
import { ApplicationHomeComponent } from "./home";

const components = [
    ApplicationCreateDialogComponent, ApplicationDefaultComponent,
    ApplicationDetailsComponent, ApplicationEditDialogComponent, ApplicationErrorDisplayComponent,
    ApplicationHomeComponent, ApplicationListComponent, ApplicationPackagesComponent, ApplicationPackageTableComponent,
    ApplicationPreviewComponent, ApplicationConfigurationComponent,
];

@NgModule({
    declarations: components,
    exports: components,
    imports: [BatchApplicationRoutingModule, ...commonModules ],
    entryComponents: [
        ApplicationCreateDialogComponent,
        ApplicationEditDialogComponent,
    ],
})
export class ApplicationModule {
}
