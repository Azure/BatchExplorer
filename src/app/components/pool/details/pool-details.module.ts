import { NgModule } from "@angular/core";
import { TimeRangePickerModule } from "@batch-flask/ui";
import { commonModules } from "app/common";
import { ResourceFilesPropertiesModule } from "app/components/common";
import { JobActionModule } from "app/components/job/action";
import { NodeBrowseModule } from "app/components/node/browse";
import { PoolBaseModule } from "app/components/pool/base";
import { PoolErrorDisplayComponent } from "app/components/pool/details/error-display";
import { PoolDefaultComponent } from "app/components/pool/details/pool-default.component";
import { PoolDetailsComponent } from "app/components/pool/details/pool-details.component";
import { PoolGraphsModule } from "app/components/pool/graphs";
import { StartTaskModule } from "app/components/pool/start-task";
import { PoolConfigurationComponent } from "./configuration";
import { PoolCostCardComponent } from "./pool-cost-card";

const components = [
    PoolConfigurationComponent, PoolDefaultComponent, PoolDetailsComponent,
    PoolErrorDisplayComponent, PoolCostCardComponent,
];

@NgModule({
    declarations: components,
    exports: components,
    imports: [
        ...commonModules,
        PoolBaseModule,
        PoolGraphsModule,
        JobActionModule,
        NodeBrowseModule,
        StartTaskModule,
        ResourceFilesPropertiesModule,
        TimeRangePickerModule,
    ],
})
export class PoolDetailsModule {
}
