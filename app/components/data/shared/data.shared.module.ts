import { NgModule } from "@angular/core";

import { commonModules } from "app/common";
import { FileGroupPickerComponent } from "./file-group-picker";
import { FileGroupsPickerComponent } from "./file-groups-picker";

const components = [FileGroupPickerComponent, FileGroupsPickerComponent];

@NgModule({
    declarations: components,
    exports: components,
    imports: [
        ...commonModules,
    ],
    entryComponents: [],
})
export class DataSharedModule {
}
