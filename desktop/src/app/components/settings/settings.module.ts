import { NgModule } from "@angular/core";
import { commonModules } from "app/common";
import { AuthSettingsModule } from "./auth-settings/auth-settings.module";
import { SettingsComponent } from "./settings.component";

const components = [
    SettingsComponent,
];

const modules = [
    AuthSettingsModule,
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
