import { NgModule } from "@angular/core";
import { commonModules } from "app/common";
import { TenantCardComponent } from "./tenant-card.component";
import { TenantPickerComponent } from "./tenant-picker.component";

const components = [ TenantPickerComponent, TenantCardComponent ];
@NgModule({
    declarations: components,
    exports: components,
    imports: [ ...commonModules ]
})
export class TenantPickerModule {}
