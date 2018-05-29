import { NgModule } from "@angular/core";
import { MatProgressBarModule } from "@angular/material";
import { BrowserModule } from "@angular/platform-browser";

import { QuotaDisplayComponent } from "./quota-display";

const privateComponents = [];
const publicComponents = [QuotaDisplayComponent];

@NgModule({
    imports: [BrowserModule, MatProgressBarModule],
    declarations: [...privateComponents, publicComponents],
    exports: publicComponents,
})
export class QuotasModule {

}
