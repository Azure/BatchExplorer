import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { RouterModule } from "@angular/router";
import { MaterialModule } from "@batch-flask/core";
import { I18nTestingModule } from "@batch-flask/core/testing";
import { AbstractListModule } from "@batch-flask/ui/abstract-list";
import { BreadcrumbModule } from "@batch-flask/ui/breadcrumbs";
import { ContextMenuModule } from "@batch-flask/ui/context-menu";
import { LoadingModule } from "@batch-flask/ui/loading";
import {
    NoItemComponent,
    QuickListComponent,
    QuickListItemStatusComponent,
    QuickListRowExtraDirective,
    QuickListRowStateDirective,
    QuickListRowStatusDirective,
    QuickListRowTitleDirective,
} from "@batch-flask/ui/quick-list";
import { QuickListRowRenderComponent } from "@batch-flask/ui/quick-list/quick-list-row-render";
import { VirtualScrollTestingModule } from "@batch-flask/ui/testing/virtual-scroll";

const publicComponents = [
    NoItemComponent,
    QuickListComponent,
    QuickListItemStatusComponent,
    QuickListRowStatusDirective,
    QuickListRowTitleDirective,
    QuickListRowStateDirective,
    QuickListRowExtraDirective,
    QuickListRowRenderComponent,
];

@NgModule({
    declarations: publicComponents,
    exports: publicComponents,
    imports: [
        CommonModule,
        FormsModule,
        RouterModule,
        MaterialModule,
        ContextMenuModule,
        LoadingModule,
        BreadcrumbModule,
        AbstractListModule,

        // Mock modules
        I18nTestingModule,
        VirtualScrollTestingModule,
    ],
})
export class QuickListTestingModule {
}
