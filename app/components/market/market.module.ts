import { NgModule } from "@angular/core";

import { commonModules } from "app/common";
import { ChooseActionComponent } from "app/components/market/application-action";
import { MarketComponent } from "app/components/market/home";
import { SubmitMarketApplicationComponent } from "app/components/market/submit";
import { TaskBaseModule } from "app/components/task/base";
import { JobActionModule } from "app/components/job/action";

const components = [
    ChooseActionComponent,
    MarketComponent,
    SubmitMarketApplicationComponent,
];

const modules = [
    TaskBaseModule,JobActionModule,  ...commonModules,
];

@NgModule({
    declarations: components,
    exports: [...modules, ...components],
    imports: [...modules],
    entryComponents: [
    ],
})
export class MarketModule {
}
