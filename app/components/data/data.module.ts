import { NgModule } from "@angular/core";

import { commonModules } from "app/common";
import { FileGroupListComponent, FileGroupPreviewComponent } from "./browse";
import { DataDefaultComponent, DataDetailsComponent } from "./details";
import { StorageErrorDisplayComponent } from "./details/errors";
import { DataHomeComponent } from "./home";

const components = [DataHomeComponent, DataDefaultComponent, DataDetailsComponent,
    FileGroupListComponent, FileGroupPreviewComponent, StorageErrorDisplayComponent];

@NgModule({
    declarations: components,
    exports: components,
    imports: [...commonModules ],
    entryComponents: [
        // ApplicationCreateDialogComponent,
        // ApplicationEditDialogComponent,
        // DeleteApplicationDialogComponent,
    ],
})
export class DataModule {
}
