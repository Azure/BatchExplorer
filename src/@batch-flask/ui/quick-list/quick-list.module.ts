import { NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { BrowserModule } from "@angular/platform-browser";
import { RouterModule } from "@angular/router";
import { MaterialModule } from "@batch-flask/core";

import { LoadingModule } from "@batch-flask/ui/loading";
import { VirtualScrollModule } from "@batch-flask/ui/virtual-scroll";
import { ContextMenuModule } from "../context-menu";
import { NoItemComponent } from "./no-item.component";
import { QuickListItemComponent } from "./quick-list-item";
import { QuickListItemStatusComponent } from "./quick-list-item-status";
import {
    QuickListRowExtraDirective,
    QuickListRowStateDirective,
    QuickListRowTitleDirective,
} from "./quick-list-row-def";
import { QuickListComponent } from "./quick-list.component";

const publicComponents = [
    NoItemComponent,
    QuickListComponent,
    QuickListItemComponent,
    QuickListItemStatusComponent,
    QuickListRowTitleDirective,
    QuickListRowStateDirective,
    QuickListRowExtraDirective,

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
        VirtualScrollModule,
        LoadingModule,
    ],
})
export class QuickListModule {
}
