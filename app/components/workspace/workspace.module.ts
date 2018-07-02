import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { RouterModule } from "@angular/router";

import { MaterialModule } from "@batch-flask/core";
import { BaseModule } from "@batch-flask/ui";
import { WorkspaceDropDownComponent } from "./workspace-selector";

const components = [WorkspaceDropDownComponent];

@NgModule({
    declarations: components,
    exports: components,
    imports: [BrowserModule, MaterialModule, RouterModule, BaseModule],
})
export class WorkspaceModule {
}
