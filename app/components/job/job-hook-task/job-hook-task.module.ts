import { NgModule } from "@angular/core";

import { commonModules } from "app/common";
import { JobHookTaskBrowserComponent } from "./job-hook-task-browser";

const components = [
    JobHookTaskBrowserComponent,
];

const modules = [
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
