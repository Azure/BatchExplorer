import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { MaterialModule } from "@batch-flask/core";

import { DropdownModule } from "@batch-flask/ui/dropdown";
import { SidebarBookmarksComponent } from "./sidebar-bookmarks";
import { SidebarContentComponent } from "./sidebar-content";
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
})
export class SidebarModule {
}
