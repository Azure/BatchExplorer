import { NgModule } from "@angular/core";

import { commonModules } from "app/common";
import { FileGroupPickerComponent } from "./file-group-picker.component";

const components = [FileGroupPickerComponent];

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
