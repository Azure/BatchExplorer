import { NgModule } from "@angular/core";

import { commonModules } from "app/common";
import { FileBrowseModule } from "app/components/file/browse";
import { TaskBrowseModule } from "app/components/task/browse";
import { JobActionModule } from "../../job/action";
import { TaskBaseModule } from "../base";
import { TaskConfigurationComponent } from "./configuration";
import { TaskOutputsComponent } from "./output";
import { TaskResourceFilesComponent } from "./resource-files";
import { SubTaskListComponent, SubTaskPropertiesComponent, TaskSubTasksBrowserComponent } from "./sub-tasks";
import { TaskDefaultComponent } from "./task-default.component";
import { TaskDependencyBrowserComponent } from "./task-dependency-browser";
import { TaskDetailsComponent } from "./task-details.component";
import { TaskErrorDisplayComponent } from "./task-error-display.component";
import { TaskNodeInfoComponent } from "./task-node-info";
import { TaskTimelineComponent, TaskTimelineStateComponent } from "./task-timeline";

const components = [
    SubTaskListComponent,
    SubTaskPropertiesComponent,
    TaskConfigurationComponent,
    TaskDefaultComponent,
    TaskDependencyBrowserComponent,
    TaskDetailsComponent,
    TaskOutputsComponent,
    TaskResourceFilesComponent,
    TaskSubTasksBrowserComponent,
    TaskTimelineComponent,
    TaskTimelineStateComponent,
    TaskErrorDisplayComponent,
    TaskNodeInfoComponent,
];

@NgModule({
    declarations: components,
    exports: components,
    imports: [...commonModules,
        FileBrowseModule, TaskBrowseModule, JobActionModule, TaskBaseModule,
    ],
})
export class TaskDetailsModule {
}
