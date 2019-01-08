import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { EditableTableModule } from "@batch-flask/ui/form/editable-table";
import { ResourceFilePickerRowComponent } from "./resourcefile-picker-row";
import { ResourcefilePickerComponent } from "./resourcefile-picker.component";

const publicComponents = [ResourcefilePickerComponent];
const privateComponents = [ResourceFilePickerRowComponent];

@NgModule({
    imports: [CommonModule, ReactiveFormsModule, FormsModule, EditableTableModule],
    declarations: [...publicComponents, ...privateComponents],
    exports: publicComponents,
    entryComponents: [],
})
export class ResourceFilePickerModule {
}
