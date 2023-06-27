import { NgModule } from "@angular/core";

const privateComponents = [];
const publicComponents = [];

@NgModule({
    imports: [],
    declarations: [...privateComponents, publicComponents],
    exports: publicComponents,
})
export class PermissionModule {

}
