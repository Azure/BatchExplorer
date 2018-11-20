import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { CommonModule } from "@angular/common";
import { ButtonsModule } from "@batch-flask/ui/buttons";
import { I18nUIModule } from "@batch-flask/ui/i18n";
import { SelectModule } from "@batch-flask/ui/select";
import { EditableTableColumnComponent } from "./editable-table-column.component";
import { EditableTableComponent } from "./editable-table.component";

const publicComponents = [
    EditableTableComponent,
    EditableTableColumnComponent,
];
const privateComponents = [];

@NgModule({
    imports: [CommonModule, I18nUIModule, FormsModule, ReactiveFormsModule, ButtonsModule, SelectModule],
    declarations: [...publicComponents, ...privateComponents],
    exports: publicComponents,
    entryComponents: [],
})
export class EditableTableModule {
}
