import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { BrowserModule } from "@angular/platform-browser";
import { RouterModule } from "@angular/router";
import { MaterialModule } from "app/core";

import { FocusSectionModule } from "../focus-section";
import { VirtualScrollModule } from "../virtual-scroll";
import { TableCellComponent } from "./table-cell.component";
import { TableColumnComponent } from "./table-column.component";
import { TableHeadComponent } from "./table-head.component";
import { TableRowComponent } from "./table-row.component";
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
        VirtualScrollModule,
    ],
    exports: components,
    declarations: components,
    providers: [],
})
export class TableModule {
}
