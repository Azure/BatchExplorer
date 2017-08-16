import { NgModule } from "@angular/core";
import { ReactiveFormsModule } from "@angular/forms";
import { MaterialModule } from "@angular/material";
import { BrowserModule } from "@angular/platform-browser";
import { RouterModule } from "@angular/router";

import { BaseModule } from "app/components/base";
import { AllJobGraphsComponent } from "./all-job-graphs-home";
import { JobGraphsComponent } from "./job-graphs-home";
import { JobProgressGraphComponent } from "./job-progress-graph";
import { TasksRunningTimeGraphComponent } from "./tasks-running-time-graph";

const components = [
    AllJobGraphsComponent,
    TasksRunningTimeGraphComponent, JobProgressGraphComponent, JobGraphsComponent,
];

@NgModule({
    declarations: components,
    exports: components,
    imports: [BrowserModule, MaterialModule, RouterModule, BaseModule, ReactiveFormsModule],
})
export class JobGraphsModule {

}
