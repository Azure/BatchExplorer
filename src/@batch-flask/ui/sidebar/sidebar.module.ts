import { NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { CommonModule } from "@angular/common";
import { MaterialModule } from "@batch-flask/core";

import { DropdownModule } from "@batch-flask/ui/dropdown";
import { SidebarBookmarksComponent } from "./sidebar-bookmarks";
import { SidebarContentComponent } from "./sidebar-content";
import { SidebarManager } from "./sidebar-manager";
import { SidebarPageComponent } from "./sidebar-page";

const publicComponents = [
    SidebarContentComponent,
    SidebarPageComponent,
    SidebarBookmarksComponent,
];
const privateComponents = [];

@NgModule({
    declarations: [...publicComponents, ...privateComponents],
    entryComponents: [
        SidebarPageComponent,
    ],
    exports: [...publicComponents],
    imports: [
        CommonModule,
        FormsModule,
        DropdownModule,
        MaterialModule,
    ],
    providers: [
        SidebarManager,
    ],
})
export class SidebarModule {
}
