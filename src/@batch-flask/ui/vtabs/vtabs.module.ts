
import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";

import { ButtonsModule } from "@batch-flask/ui/buttons";
import { VTabGroupComponent } from "./vtab-group.component";
import { VTabComponent } from "./vtab.component";

const publicComponents = [
    VTabComponent,
    VTabGroupComponent,
];
@NgModule({
    exports: [...publicComponents],
    declarations: [...publicComponents],
    imports: [BrowserModule, ButtonsModule],
})
export class VTabsModule { }
