import { NgModule } from "@angular/core";

import { commonModules } from "app/common";
import { ActivatePackageDialogComponent, ApplicationCreateDialogComponent, ApplicationEditDialogComponent,
    DeleteApplicationDialogComponent,
} from "./action";
import { ApplicationListComponent, ApplicationPreviewComponent } from "./browse";
import { ApplicationDefaultComponent, ApplicationDetailsComponent , ApplicationPackageTableComponent,
    ApplicationPackagesComponent, ApplicationPropertiesComponent,
} from "./details";
import { ApplicationErrorDisplayComponent } from "./errors";
import { ApplicationHomeComponent } from "./home";

const components = [ActivatePackageDialogComponent, ApplicationCreateDialogComponent, ApplicationDefaultComponent,
    ApplicationDetailsComponent, ApplicationEditDialogComponent, ApplicationErrorDisplayComponent,
    ApplicationHomeComponent, ApplicationListComponent, ApplicationPackagesComponent, ApplicationPackageTableComponent,
    ApplicationPreviewComponent, ApplicationPropertiesComponent, DeleteApplicationDialogComponent];

@NgModule({
    declarations: components,
    exports: components,
    imports: [...commonModules ],
    entryComponents: [
        ActivatePackageDialogComponent,
        ApplicationCreateDialogComponent,
        ApplicationEditDialogComponent,
        DeleteApplicationDialogComponent,
    ],
})
export class ApplicationModule {
}
