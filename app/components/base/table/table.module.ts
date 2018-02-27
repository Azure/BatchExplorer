import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { BrowserModule } from "@angular/platform-browser";
import { RouterModule } from "@angular/router";
import { MaterialModule } from "app/core";

import { FocusSectionModule } from "../focus-section";
import { TableCellComponent } from "./table-cell";
import { TableColumnComponent } from "./table-column";
import { TableHeadComponent } from "./table-head";
import { TableRowComponent } from "./table-row";
import { TableComponent } from "./table.component";

const components = [
    TableCellComponent,
    TableColumnComponent,
    TableComponent,
    TableHeadComponent,
    TableRowComponent,
];

@NgModule({
    imports: [
        BrowserModule,
        RouterModule,
        FocusSectionModule,
        FormsModule,
        ReactiveFormsModule,
        MaterialModule,
    ],
    exports: components,
    declarations: components,
    providers: [],
})
export class TableModule {
}
