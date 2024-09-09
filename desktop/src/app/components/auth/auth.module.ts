import { NgModule } from "@angular/core";
import { commonModules } from "app/common";
import { AuthOverlayComponent, ExternalBrowserAuthToggleComponent } from ".";

const components = [AuthOverlayComponent, ExternalBrowserAuthToggleComponent];

@NgModule({
    declarations: components,
    exports: components,
    imports: commonModules
})
export class AuthModule { }
