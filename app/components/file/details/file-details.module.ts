import { NgModule } from "@angular/core";

import { commonModules } from "app/common";
import { NodeBrowseModule } from "app/components/node/browse";
import { PoolGraphsModule } from "app/components/pool/graphs";
import { StartTaskModule } from "app/components/pool/start-task";
import { FileContentComponent } from "./file-content.component";

const components = [FileContentComponent];

@NgModule({
    declarations: components,
    exports: components,
    imports: [...commonModules],
})
export class FileDetailsModule {

}
