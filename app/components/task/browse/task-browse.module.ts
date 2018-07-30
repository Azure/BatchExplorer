import { NgModule } from "@angular/core";

import { commonModules } from "app/common";
import { NodeBrowseModule } from "app/components/node/browse";
import { PoolGraphsModule } from "app/components/pool/graphs";
import { StartTaskModule } from "app/components/pool/start-task";
import { TaskBaseModule } from "../base";
import { TaskListDisplayComponent } from "./display";
import { TaskAdvancedFilterComponent } from "./filter";
import { TaskPreviewComponent } from "./preview";
import { TaskListComponent } from "./task-list.component";

const components = [TaskListComponent, TaskListDisplayComponent, TaskAdvancedFilterComponent, TaskPreviewComponent];

@NgModule({
    declarations: components,
    exports: components,
    imports: [...commonModules,
        PoolGraphsModule, NodeBrowseModule, TaskBaseModule, StartTaskModule],
})
export class TaskBrowseModule {

}
