import { NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { BrowserModule } from "@angular/platform-browser";
import { RouterModule } from "@angular/router";
import { MaterialModule } from "@batch-flask/core";
import {
    ContextMenuModule,
    LoadingModule,
    NoItemComponent,
    QuickListComponent,
    QuickListItemStatusComponent,
    QuickListRowExtraDirective,
    QuickListRowStateDirective,
    QuickListRowStatusDirective,
    QuickListRowTitleDirective,
} from "@batch-flask/ui";
import { BreadcrumbModule } from "@batch-flask/ui/breadcrumbs";
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
        BrowserModule,
        FormsModule,
        RouterModule,
        MaterialModule,
        ContextMenuModule,
        LoadingModule,
        BreadcrumbModule,

        // Mock modules
        VirtualScrollTestingModule,
    ],
})
export class QuickListTestingModule {
}
