import { NgModule } from "@angular/core";
import { commonModules } from "app/common";
import { TenantPickerModule } from "app/components/tenant-picker";
import { AuthSettingsComponent } from "./auth-settings.component";

const components = [ AuthSettingsComponent ];

const modules = [ TenantPickerModule ]

@NgModule({
    declarations: components,
    exports: components,
    imports: [ ...commonModules, ...modules ]
})
export class AuthSettingsModule {}
