import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { MaterialModule } from "@batch-flask/core";

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
    imports: [CommonModule, MaterialModule, RouterModule],
})
export class TabsModule {

}
