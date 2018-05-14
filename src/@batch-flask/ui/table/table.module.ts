import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { BrowserModule } from "@angular/platform-browser";
import { RouterModule } from "@angular/router";
import { MaterialModule } from "@batch-flask/core";

import { FocusSectionModule } from "../focus-section";
import { LoadingModule } from "../loading";
import { VirtualScrollModule } from "../virtual-scroll";
import { TableCellComponent, TableCellDefDirective } from "./table-cell";
import { TableColumnComponent } from "./table-column";
import { TableHeadCellComponent, TableHeadComponent } from "./table-head";
import { TableHeaderCellDefComponent } from "./table-header-cell-def";
import { TableRowComponent } from "./table-row";
import { TableRowRenderComponent } from "./table-row-render";
import { TableComponent } from "./table.component";

const privateComponents = [TableRowRenderComponent, TableHeadCellComponent];
const publicComponents = [
    TableCellComponent,
    TableColumnComponent,
    TableComponent,
    TableHeadComponent,
    TableRowComponent,
    TableHeaderCellDefComponent,
    TableCellDefDirective,
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
        LoadingModule,
    ],
    exports: publicComponents,
    declarations: [...privateComponents, publicComponents],
    providers: [],
})
export class TableModule {
}
