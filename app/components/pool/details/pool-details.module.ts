import { NgModule } from "@angular/core";
import { MaterialModule } from "@angular/material";
import { BrowserModule } from "@angular/platform-browser";
import { RouterModule } from "@angular/router";

import { BaseModule } from "app/components/base";
import { NodeBrowseModule } from "app/components/node/browse";
import { PoolGraphsModule } from "app/components/pool/graphs";
import { StartTaskModule } from "app/components/pool/start-task";
import { PoolDetailsHomeComponent } from "./pool-details-home.component";
import { PoolDetailsComponent } from "./pool-details.component";
import { PoolErrorDisplayComponent } from "./pool-error-display.component";
import { PoolPropertiesComponent } from "./pool-properties.component";

const components = [PoolPropertiesComponent, PoolDetailsComponent, PoolDetailsHomeComponent, PoolErrorDisplayComponent];

@NgModule({
    declarations: components,
    exports: components,
    imports: [BrowserModule, MaterialModule, RouterModule, BaseModule,
        PoolGraphsModule, NodeBrowseModule, StartTaskModule],
})
export class PoolDetailsModule {

}
