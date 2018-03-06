import { NgModule } from "@angular/core";
import { PermissionService } from "./permission.service";

const privateComponents = [];
const publicComponents = [];

@NgModule({
    imports: [],
    declarations: [...privateComponents, publicComponents],
    exports: publicComponents,
    providers: [
        PermissionService,
    ],
})
export class PermissionModule {

}
