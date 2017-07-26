import { NgModule } from "@angular/core";

import { commonModules } from "app/common";
import { ChooseActionComponent } from "app/components/market/application-action";
import { MarketComponent } from "app/components/market/home";
import { MarketHomeComponent } from "app/components/market/home/market-home.component";
import { TaskBaseModule } from "app/components/task/base";

const components = [
    ChooseActionComponent,
    MarketHomeComponent,
    MarketComponent,
];

const modules = [
    TaskBaseModule, ...commonModules,
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
