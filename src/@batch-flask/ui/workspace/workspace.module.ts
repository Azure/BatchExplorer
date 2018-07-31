import { NgModule } from "@angular/core";
import { FeatureVisibleDirective } from "./feature-visible.directive";

import { WorkspaceService } from "./workspace.service";

const privateComponents = [];
const publicComponents = [ FeatureVisibleDirective ];

@NgModule({
    imports: [],
    declarations: [...privateComponents, publicComponents],
    exports: publicComponents,
    providers: [
        WorkspaceService,
    ],
})

export class WorkspaceModule {
}
