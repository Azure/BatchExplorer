import { NgModule } from "@angular/core";

import { commonModules } from "app/common";
import { SettingsComponent } from "./settings.component";

const components = [
    SettingsComponent,
];

const modules = [
];

@NgModule({
    declarations: components,
    exports: components,
    imports: [
        ...commonModules,
        ...modules,
    ],
})
export class SettingsModule {
}
