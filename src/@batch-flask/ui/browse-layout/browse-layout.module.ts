import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { BrowserModule } from "@angular/platform-browser";
import { RouterModule } from "@angular/router";

import { ButtonsModule } from "@batch-flask/ui/buttons";
import { FormModule } from "@batch-flask/ui/form";
import { ScrollableModule } from "@batch-flask/ui/scrollable";
import { BrowseLayoutAdvancedFilterDirective } from "./browse-layout-advanced-filter";
import { BrowseLayoutListDirective } from "./browse-layout-list";
import { BrowseLayoutComponent } from "./browse-layout.component";
import { ToggleFilterButtonComponent } from "./toggle-filter-button";

const privateComponents = [];
const publicComponents = [
    BrowseLayoutComponent,
    BrowseLayoutListDirective,
    ToggleFilterButtonComponent,
    BrowseLayoutAdvancedFilterDirective];

@NgModule({
    imports: [
        ScrollableModule, BrowserModule, FormsModule,
        ReactiveFormsModule, ButtonsModule, RouterModule, FormModule,
    ],
    declarations: [...privateComponents, publicComponents],
    exports: publicComponents,
})
export class BrowseLayoutModule {
}
