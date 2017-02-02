import { NgModule } from "@angular/core";

import { commonModules } from "app/common";
import { FileBrowseModule } from "app/components/file/browse";
import { FileDetailsModule } from "app/components/file/details";
import { TaskBrowseModule } from "app/components/task/browse";

import { NoTaskSelectedComponent } from "./no-task-selected.component";
import { SubTaskDisplayListComponent, SubTaskPropertiesComponent } from "./sub-tasks";
import { TaskDependenciesComponent } from "./task-dependencies.component";
import { TaskDetailsComponent } from "./task-details.component";
import { TaskEnvironmentSettingsComponent } from "./task-env-settings.component";
import { TaskErrorDisplayComponent } from "./task-error-display.component";
import { TaskLifetimeComponent, TaskLifetimeStateComponent } from "./task-lifetime";
import { TaskPropertiesComponent } from "./task-properties.component";
import { TaskResourceFilesComponent } from "./task-resource-files.component";
import { TaskSubTasksTabComponent } from "./task-sub-tasks-tab.component";

const components = [
    TaskLifetimeComponent, TaskLifetimeStateComponent, NoTaskSelectedComponent,
    TaskDependenciesComponent, TaskDetailsComponent,
    TaskEnvironmentSettingsComponent, TaskPropertiesComponent, TaskResourceFilesComponent, TaskSubTasksTabComponent,
    SubTaskPropertiesComponent, SubTaskDisplayListComponent, TaskErrorDisplayComponent,
];

@NgModule({
    declarations: components,
    exports: components,
    imports: [...commonModules,
        FileBrowseModule, FileDetailsModule, TaskBrowseModule],
})
export class TaskDetailsModule {
}
