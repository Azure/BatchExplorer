import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { BrowserModule } from "@angular/platform-browser";

import { ButtonsModule } from "app/components/base/buttons";
import { ScrollableModule } from "app/components/base/scrollable";
import { BrowseLayoutAdvancedFilterDirective } from "./browse-layout-advanced-filter";
import { BrowseLayoutListDirective } from "./browse-layout-list";
import { BrowseLayoutComponent } from "./browse-layout.component";

const privateComponents = [];
const publicComponents = [BrowseLayoutComponent, BrowseLayoutListDirective, BrowseLayoutAdvancedFilterDirective];

@NgModule({
    imports: [ScrollableModule, BrowserModule, FormsModule, ReactiveFormsModule, ButtonsModule],
    declarations: [...privateComponents, publicComponents],
    exports: publicComponents,
})
export class BrowseLayoutModule {
}
