import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { RouterModule } from "@angular/router";
import { MaterialModule } from "@batch-flask/core";

import { SplitPaneComponent } from "./split-pane.component";
import { SplitSeparatorComponent } from "./split-separator";

const privateComponents = [
    SplitSeparatorComponent,
];
const publicComponents = [
    SplitPaneComponent,
];

@NgModule({
    declarations: [...privateComponents, ...publicComponents],
    exports: publicComponents,
    imports: [BrowserModule, MaterialModule, RouterModule],
})
export class SplitPaneModule {

}
