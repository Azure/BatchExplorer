import { NgModule } from "@angular/core";

import { WorkspaceService } from "./workspace.service";

@NgModule({
    providers: [
        WorkspaceService,
    ],
})
export class WorkspaceModule {
}
