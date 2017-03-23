import { NgModule } from "@angular/core";

import { commonModules } from "app/common";
import { NodeBrowseModule } from "app/components/node/browse";
import { PoolNodesPreviewComponent } from "app/components/pool/base/pool-nodes-preview.component";
import { PoolErrorDisplayComponent } from "app/components/pool/details/error-display";
import { PoolConfigurationComponent } from "app/components/pool/details/pool-configuration.component";
import { PoolDefaultComponent } from "app/components/pool/details/pool-default.component";
import { PoolDetailsComponent } from "app/components/pool/details/pool-details.component";
import { PoolGraphsModule } from "app/components/pool/graphs";
import { StartTaskModule } from "app/components/pool/start-task";

const components = [
    PoolConfigurationComponent, PoolDefaultComponent, PoolDetailsComponent,
    PoolErrorDisplayComponent, PoolNodesPreviewComponent
];

@NgModule({
    declarations: components,
    exports: components,
    imports: [...commonModules,
        PoolGraphsModule, NodeBrowseModule, StartTaskModule],
})
export class PoolDetailsModule {
}
