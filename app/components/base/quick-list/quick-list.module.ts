import { NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { BrowserModule } from "@angular/platform-browser";
import { RouterModule } from "@angular/router";
import { MaterialModule } from "app/core";

import { VirtualScrollModule } from "app/components/base/virtual-scroll";
import { ContextMenuModule } from "../context-menu";
import { NoItemComponent } from "./no-item.component";
import { QuickListItemComponent } from "./quick-list-item";
import { QuickListItemStatusComponent } from "./quick-list-item-status";
import { QuickListComponent } from "./quick-list.component";

const publicComponents = [
    NoItemComponent,
    QuickListComponent,
    QuickListItemComponent,
    QuickListItemStatusComponent,
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
    ],
})
export class QuickListModule {
}
