import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { RouterModule } from "@angular/router";
import { MaterialModule } from "@batch-flask/core";

import { BaseModule } from "@batch-flask/ui";
import { NodeListDisplayComponent } from "./display";
import { NodeAdvancedFilterComponent } from "./filter";
import { NodeListComponent } from "./node-list.component";

const components = [NodeListComponent, NodeAdvancedFilterComponent, NodeListDisplayComponent];

@NgModule({
    declarations: components,
    exports: components,
    imports: [BrowserModule, MaterialModule, RouterModule, BaseModule],
})
export class NodeBrowseModule {

}
