
import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { RouterModule } from "@angular/router";
import { MaterialModule } from "@batch-flask/core";
import { I18nTestingModule } from "@batch-flask/core/testing";
import { AbstractListModule } from "@batch-flask/ui/abstract-list";
import { BreadcrumbModule } from "@batch-flask/ui/breadcrumbs";
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
        LoadingModule,
        BreadcrumbModule,
        AbstractListModule,

        // Mock modules
        I18nTestingModule,
        VirtualScrollTestingModule,
    ],
    exports: publicComponents,
    declarations: [...privateComponents, publicComponents],
    providers: [],
})
export class TableTestingModule {
}
