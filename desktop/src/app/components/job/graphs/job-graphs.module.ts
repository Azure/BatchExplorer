import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { ReactiveFormsModule } from "@angular/forms";
import { RouterModule } from "@angular/router";
import { MaterialModule } from "@batch-flask/core";
import { BaseModule } from "@batch-flask/ui";
import { AllJobGraphsComponent } from "./all-job-graphs-home";
import { JobsBarChartComponent } from "./all-job-graphs-home/jobs-bar-chart";
import { JobsCpuWaitTimeGraphComponent } from "./all-job-graphs-home/jobs-cpu-wait-time-graph";
import { JobsRunningTimeComponent } from "./all-job-graphs-home/jobs-running-time-graph";
import { JobGraphsComponent } from "./job-graphs-home";
import { JobProgressGraphComponent } from "./job-progress-graph";
import { TasksRunningTimeGraphComponent } from "./tasks-running-time-graph";

const components = [
    AllJobGraphsComponent,
    TasksRunningTimeGraphComponent, JobProgressGraphComponent, JobGraphsComponent,
    JobsRunningTimeComponent, JobsCpuWaitTimeGraphComponent, JobsBarChartComponent,
];

@NgModule({
    declarations: components,
    exports: components,
    imports: [CommonModule, MaterialModule, RouterModule, BaseModule, ReactiveFormsModule],
})
export class JobGraphsModule {

}
