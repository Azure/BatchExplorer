import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { SelectModule } from "@batch-flask/ui";
import { StorageAccountPickerComponent } from "./storage-account-picker.component";

const publicComponents = [StorageAccountPickerComponent];
const privateComponents = [];

@NgModule({
    imports: [
        CommonModule,
        ReactiveFormsModule,
        FormsModule,
        SelectModule,
    ],
    declarations: [...publicComponents, ...privateComponents],
    exports: publicComponents,
    entryComponents: [],
})
export class StorageAccountPickerModule {
}
