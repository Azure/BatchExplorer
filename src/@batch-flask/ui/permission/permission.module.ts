import { NgModule } from "@angular/core";
import { PermissionService } from "@batch-flask/ui/permission";

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
