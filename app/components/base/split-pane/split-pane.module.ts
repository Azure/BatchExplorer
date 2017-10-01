import { NgModule } from "@angular/core";
import { MaterialModule } from "@angular/material";
import { BrowserModule } from "@angular/platform-browser";
import { RouterModule } from "@angular/router";

import { SplitPaneComponent } from "./split-pane.component";
import { SplitSeparatorComponent } from "./split-separator";

const components = [
    SplitPaneComponent,
    SplitSeparatorComponent,
];

@NgModule({
    declarations: components,
    exports: components,
    imports: [BrowserModule, MaterialModule, RouterModule],
})
export class SplitPaneModule {

}
