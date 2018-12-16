import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { MatTooltipModule } from "@angular/material";
import { JobStateComponent } from "./job-state";

const publicComponents = [JobStateComponent];
const privateComponents = [];

@NgModule({
    imports: [CommonModule, MatTooltipModule],
    declarations: [...publicComponents, ...privateComponents],
    exports: publicComponents,
    entryComponents: [],
})
export class JobBaseModule {
}
