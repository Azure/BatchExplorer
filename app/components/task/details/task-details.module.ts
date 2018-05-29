import { NgModule } from "@angular/core";

import { commonModules } from "app/common";
import { FileBrowseModule } from "app/components/file/browse";
import { FileDetailsModule } from "app/components/file/details";
import { TaskBrowseModule } from "app/components/task/browse";

import { JobActionModule } from "../../job/action";
import { TaskOutputsComponent } from "./output";
import { SubTaskDisplayListComponent, SubTaskPropertiesComponent } from "./sub-tasks";
import { TaskConfigurationComponent } from "./task-configuration.component";
import { TaskDefaultComponent } from "./task-default.component";
import { TaskDependenciesComponent } from "./task-dependencies";
import { TaskDetailsComponent } from "./task-details.component";
import { TaskErrorDisplayComponent } from "./task-error-display.component";
import { TaskResourceFilesComponent } from "./task-resource-files.component";
import { TaskSubTasksTabComponent } from "./task-sub-tasks-tab.component";
import { TaskTimelineComponent, TaskTimelineStateComponent } from "./task-timeline";

const components = [
    SubTaskDisplayListComponent, SubTaskPropertiesComponent, TaskConfigurationComponent,
    TaskDefaultComponent, TaskDependenciesComponent, TaskDetailsComponent, TaskOutputsComponent,
    TaskResourceFilesComponent, TaskSubTasksTabComponent, TaskTimelineComponent, TaskTimelineStateComponent,
    TaskErrorDisplayComponent,
];

@NgModule({
    declarations: components,
    exports: components,
    imports: [...commonModules,
        FileBrowseModule, FileDetailsModule, TaskBrowseModule, JobActionModule,
    ],
})
export class TaskDetailsModule {
}
