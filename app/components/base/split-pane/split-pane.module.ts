import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { RouterModule } from "@angular/router";
import { MaterialModule } from "app/core";

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
