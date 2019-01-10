import { NgModule } from "@angular/core";

import { commonModules } from "app/common";
import { DataSharedModule } from "app/components/data/shared";
import { PoolBaseModule } from "app/components/pool/base";
import {
    AddTaskFormComponent,
    MultiInstanceSettingsPickerComponent,
    RerunTaskFormComponent,
} from "app/components/task/action";
import { TaskBaseModule } from "app/components/task/base";
import { TaskBrowseModule } from "app/components/task/browse";
import { TaskDetailsModule } from "app/components/task/details";
import { TaskHomeComponent } from "app/components/task/home";
import { ResourceFilePickerModule } from "../common";
import { TaskRoutingModule } from "./task-routing.module";

const components = [
    TaskHomeComponent, RerunTaskFormComponent, AddTaskFormComponent, MultiInstanceSettingsPickerComponent,
];

const modules = [
    TaskRoutingModule, DataSharedModule, PoolBaseModule,
    TaskBaseModule, TaskBrowseModule, TaskDetailsModule, ...commonModules,
];

@NgModule({
    declarations: components,
    exports: [...modules, ...components],
    imports: [...modules, ResourceFilePickerModule],
    entryComponents: [
        RerunTaskFormComponent,
        AddTaskFormComponent,
    ],
})
export class TaskModule {
}
