import { NgModule } from "@angular/core";

import { commonModules } from "app/common";
import { FileBrowseModule } from "app/components/file/browse";
import { JobHookTaskBrowserComponent } from "./job-hook-task-browser";
import { JobHookTaskDetailsComponent } from "./job-hook-task-details";

const components = [
    JobHookTaskBrowserComponent,
    JobHookTaskDetailsComponent,
];

const modules = [
    FileBrowseModule,
    ...commonModules,
];

@NgModule({
    declarations: components,
    exports: [...modules, ...components],
    imports: [...modules],
    entryComponents: [
    ],
})
export class JobHookTaskModule {
}
