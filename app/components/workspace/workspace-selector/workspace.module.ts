import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { BrowserModule } from "@angular/platform-browser";

import { MaterialModule } from "@batch-flask/core";
import { BaseModule } from "@batch-flask/ui";
import { WorkspaceDropDownComponent } from "./workspace-dropdown.component";

const components = [WorkspaceDropDownComponent];

@NgModule({
    declarations: components,
    exports: components,
    imports: [BrowserModule, MaterialModule, RouterModule, BaseModule],
})
export class WorkspaceModule {

}
