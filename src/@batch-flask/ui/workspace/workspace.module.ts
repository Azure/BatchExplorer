import { NgModule } from "@angular/core";
import { FeatureVisibleDirective } from "./feature-visible.directive";

const privateComponents = [];
const publicComponents = [ FeatureVisibleDirective ];

@NgModule({
    imports: [],
    declarations: [...privateComponents, publicComponents],
    exports: publicComponents,
})

export class WorkspaceModule {
}
