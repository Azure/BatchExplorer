import { ModuleWithProviders, NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { BrowserModule } from "@angular/platform-browser";
import { MaterialModule } from "app/core";

import { SidebarBookmarksComponent } from "./sidebar-bookmarks";
import { SidebarContentComponent } from "./sidebar-content";
import { SidebarManager } from "./sidebar-manager";
import { SidebarPageComponent } from "./sidebar-page";

@NgModule({
    declarations: [
        SidebarContentComponent,
        SidebarPageComponent,
        SidebarBookmarksComponent,
    ],
    entryComponents: [
        SidebarPageComponent,
    ],
    exports: [
        SidebarContentComponent,
        SidebarPageComponent,
        SidebarBookmarksComponent],
    imports: [
        BrowserModule,
        FormsModule,
        MaterialModule,
    ],
    providers: [
        SidebarManager,
    ],
})
export class SidebarModule {
    public static forRoot(): ModuleWithProviders {
        return {
            ngModule: SidebarModule,
            providers: [],
        };
    }
}
