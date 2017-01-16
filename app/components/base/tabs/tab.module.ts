import { NgModule } from "@angular/core";
import { MaterialModule } from "@angular/material";
import { BrowserModule } from "@angular/platform-browser";
import { RouterModule } from "@angular/router";

import { TabGroupComponent } from "./tab-group.component";
import { TabComponent, TabLabelComponent } from "./tab.component";

const components = [
    TabComponent,
    TabGroupComponent,
    TabLabelComponent,
];

@NgModule({
    declarations: components,
    exports: components,
    imports: [BrowserModule, MaterialModule, RouterModule],
})
export class TabsModule {

}
