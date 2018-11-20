import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { CommonModule } from "@angular/common";
import { RouterModule } from "@angular/router";
import { MaterialModule } from "@batch-flask/core";
import { AbstractListModule } from "@batch-flask/ui/abstract-list";
import { ContextMenuModule } from "@batch-flask/ui/context-menu";
import { FocusSectionModule } from "../focus-section";
import { LoadingModule } from "../loading";
import { VirtualScrollModule } from "../virtual-scroll";
import { TableCellDefDirective } from "./table-cell-def";
import { TableColumnComponent } from "./table-column";
import { TableHeadCellComponent, TableHeadComponent } from "./table-head";
import { TableHeadCellDefDirective } from "./table-head-cell-def";
import { TableRowRenderComponent } from "./table-row-render";
import { TableComponent } from "./table.component";

const privateComponents = [
    TableRowRenderComponent,
    TableHeadCellComponent,
    TableHeadComponent,
];

const publicComponents = [
    TableColumnComponent,
    TableComponent,
    TableHeadCellDefDirective,
    TableCellDefDirective,
];

@NgModule({
    imports: [
        CommonModule,
        RouterModule,
        FocusSectionModule,
        FormsModule,
        ReactiveFormsModule,
        MaterialModule,
        VirtualScrollModule,
        LoadingModule,
        ContextMenuModule,
        AbstractListModule,
    ],
    exports: publicComponents,
    declarations: [...privateComponents, publicComponents],
    providers: [],
})
export class TableModule {
}
