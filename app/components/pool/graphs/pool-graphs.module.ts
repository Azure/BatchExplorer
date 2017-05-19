import { NgModule } from "@angular/core";
import { ReactiveFormsModule } from "@angular/forms";
import { MaterialModule } from "@angular/material";
import { BrowserModule } from "@angular/platform-browser";
import { RouterModule } from "@angular/router";

import { BaseModule } from "app/components/base";
import { HistoryGraphComponent } from "./history-graph";
import { NodePreviewCardComponent } from "./node-preview-card.component";
import { NodesHeatmapLegendComponent } from "./nodes-heatmap-legend.component";
import { NodesHeatmapComponent } from "./nodes-heatmap.component";
import { PoolGraphsComponent } from "./pool-graphs.component";

const components = [NodePreviewCardComponent, NodesHeatmapComponent,
    NodesHeatmapLegendComponent, PoolGraphsComponent, HistoryGraphComponent];

@NgModule({
    declarations: components,
    exports: components,
    imports: [BrowserModule, MaterialModule, RouterModule, BaseModule, ReactiveFormsModule],
})
export class PoolGraphsModule {

}
