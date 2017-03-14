import { NgModule } from "@angular/core";

import { GaugeComponent } from "./gauge.component";

const components = [GaugeComponent];

@NgModule({
    declarations: components,
    exports: components,
})
export class GraphsModule {

}
