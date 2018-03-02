import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { RouterModule } from "@angular/router";
import { MaterialModule } from "@bl-common/core";

import { BaseModule } from "@bl-common/ui";
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
