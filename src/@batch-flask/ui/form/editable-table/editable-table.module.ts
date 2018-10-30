import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { EditableTableColumnComponent } from "./editable-table-column.component";
import { EditableTableComponent } from "./editable-table.component";

const publicComponents = [
    EditableTableComponent,
    EditableTableColumnComponent,
];
const privateComponents = [];

@NgModule({
    imports: [BrowserModule],
    declarations: [...publicComponents, ...privateComponents],
    exports: publicComponents,
    entryComponents: [],
})
export class EditableTableModule {
}
