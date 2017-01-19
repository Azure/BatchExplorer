import { NgModule } from "@angular/core";

import { commonModules } from "app/common";
import { FileDetailsModule } from "app/components/file/details";
import { TaskBrowseModule } from "app/components/task/browse";
// import { PoolGraphsModule } from "app/components/pool/graphs";
// import { StartTaskModule } from "app/components/pool/start-task";

import { NoTaskSelectedComponent } from "./no-task-selected.component";
import { SubTaskDisplayListComponent, SubTaskPropertiesComponent } from "./sub-tasks";
import { TaskDetailsComponent } from "./task-details.component";
import { TaskEnvironmentSettingsComponent } from "./task-env-settings.component";
import { TaskPropertiesComponent } from "./task-properties.component";
import { TaskResourceFilesComponent } from "./task-resource-files.component";
import { TaskSubTasksTabComponent } from "./task-sub-tasks-tab.component";

const components = [NoTaskSelectedComponent, TaskDetailsComponent, TaskEnvironmentSettingsComponent,
    TaskPropertiesComponent, TaskResourceFilesComponent, TaskSubTasksTabComponent,
    SubTaskPropertiesComponent, SubTaskDisplayListComponent];

@NgModule({
    declarations: components,
    exports: components,
    imports: [...commonModules,
        FileDetailsModule, TaskBrowseModule],
})
export class TaskDetailsModule {

}
