import { ModuleWithProviders, NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { MaterialModule } from "@angular/material";
import { BrowserModule } from "@angular/platform-browser";
import { RouterModule } from "@angular/router";

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
    ],
})
export class QuickListModule {
    public static forRoot(): ModuleWithProviders {
        return {
            ngModule: QuickListModule,
            providers: [],
        };
    }
}
