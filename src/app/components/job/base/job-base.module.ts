import { NgModule } from "@angular/core";
import { MatTooltipModule } from "@angular/material";
import { BrowserModule } from "@angular/platform-browser";
import { JobStateComponent } from "./job-state";

const publicComponents = [JobStateComponent];
const privateComponents = [];

@NgModule({
    imports: [BrowserModule, MatTooltipModule],
    declarations: [...publicComponents, ...privateComponents],
    exports: publicComponents,
    entryComponents: [],
})
export class JobBaseModule {
}
