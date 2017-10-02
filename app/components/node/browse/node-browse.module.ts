import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { RouterModule } from "@angular/router";
import { MaterialModule } from "app/core";

import { BaseModule } from "app/components/base";
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
