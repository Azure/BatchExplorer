import { NgModule } from "@angular/core";

import { commonModules } from "app/common";
import { ActivatePackageDialogComponent } from "./action/activate/activate-package-dialog.component";
import { ApplicationCreateDialogComponent } from "./action/add/application-create-dialog.component";
import { DeleteApplicationDialogComponent } from "./action/delete/delete-application-dialog.component";
import { ApplicationListComponent } from "./browse/application-list.component";
import { ApplicationPreviewComponent } from "./browse/preview";
import { ApplicationDetailsHomeComponent } from "./details/application-details-home.component";
import { ApplicationDetailsComponent } from "./details/application-details.component";
import { ApplicationPackagesComponent } from "./details/application-packages.component";
import { ApplicationPropertiesComponent } from "./details/application-properties.component";
import { ApplicationErrorDisplayComponent } from "./errors/application-error-display.component";
import { ApplicationHomeComponent } from "./home/application-home.component";

const components = [ActivatePackageDialogComponent, ApplicationCreateDialogComponent, ApplicationDetailsHomeComponent,
    ApplicationDetailsComponent, ApplicationErrorDisplayComponent, ApplicationHomeComponent, ApplicationListComponent,
    ApplicationPreviewComponent, ApplicationPackagesComponent, ApplicationPropertiesComponent,
    DeleteApplicationDialogComponent];

@NgModule({
    declarations: components,
    exports: components,
    imports: [...commonModules ],
    entryComponents: [
        ActivatePackageDialogComponent,
        ApplicationCreateDialogComponent,
        DeleteApplicationDialogComponent
    ],
})
export class ApplicationModule {
}
