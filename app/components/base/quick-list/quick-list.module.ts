import { NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { BrowserModule } from "@angular/platform-browser";
import { RouterModule } from "@angular/router";
import { MaterialModule } from "app/core";

import { VirtualScrollModule } from "app/components/base/virtual-scroll";
import { ContextMenuModule } from "../context-menu";
import { NoItemComponent } from "./no-item.component";
import { QuickListItemComponent } from "./quick-list-item.component";
import { QuickListComponent, QuickListItemStatusComponent } from "./quick-list.component";

@NgModule({
    declarations: [
        NoItemComponent,
        QuickListComponent,
        QuickListItemComponent,
        QuickListItemStatusComponent,
    ],
    exports: [
        NoItemComponent,
        QuickListComponent,
        QuickListItemComponent,
        QuickListItemStatusComponent,
    ],
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
