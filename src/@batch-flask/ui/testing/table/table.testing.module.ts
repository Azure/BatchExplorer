
import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { BrowserModule } from "@angular/platform-browser";
import { RouterModule } from "@angular/router";
import { MaterialModule } from "@batch-flask/core";
import { BreadcrumbModule } from "@batch-flask/ui/breadcrumbs";
import { ContextMenuModule } from "@batch-flask/ui/context-menu";
import { FocusSectionModule } from "@batch-flask/ui/focus-section";
import { LoadingModule } from "@batch-flask/ui/loading";
import {
    TableCellDefDirective,
    TableColumnComponent,
    TableComponent,
    TableHeadCellComponent,
    TableHeadCellDefDirective,
    TableHeadComponent,
} from "@batch-flask/ui/table";
import { TableRowRenderComponent } from "@batch-flask/ui/table/table-row-render";
import { VirtualScrollTestingModule } from "@batch-flask/ui/testing/virtual-scroll";
import { AbstractListModule } from "@batch-flask/ui/abstract-list";

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
        BrowserModule,
        RouterModule,
        FocusSectionModule,
        FormsModule,
        ReactiveFormsModule,
        MaterialModule,
        LoadingModule,
        ContextMenuModule,
        BreadcrumbModule,
        AbstractListModule,

        // Mock modules
        VirtualScrollTestingModule,
    ],
    exports: publicComponents,
    declarations: [...privateComponents, publicComponents],
    providers: [],
})
export class TableTestingModule {
}
