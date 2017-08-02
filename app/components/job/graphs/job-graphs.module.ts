import { NgModule } from "@angular/core";
import { ReactiveFormsModule } from "@angular/forms";
import { MaterialModule } from "@angular/material";
import { BrowserModule } from "@angular/platform-browser";
import { RouterModule } from "@angular/router";

import { BaseModule } from "app/components/base";
import { JobGraphsComponent } from "app/components/job/graphs/job-graphs-home";
import { TasksRunningTimeGraphComponent } from "./tasks-running-time-graph";

const components = [TasksRunningTimeGraphComponent, JobGraphsComponent];

@NgModule({
    declarations: components,
    exports: components,
    imports: [BrowserModule, MaterialModule, RouterModule, BaseModule, ReactiveFormsModule],
})
export class JobGraphsModule {

}
