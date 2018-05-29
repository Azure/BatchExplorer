import { NgModule } from "@angular/core";

import { ChartDirective } from "./chart.directive";

@NgModule({
    declarations: [
        ChartDirective,
    ],
    exports: [
        ChartDirective,
    ],
    imports: [],
})
export class ChartsModule {
}
