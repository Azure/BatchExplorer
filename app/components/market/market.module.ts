import { NgModule } from "@angular/core";

import { commonModules } from "app/common";
import { MarketHomeComponent } from "app/components/market/home/market-home.component";
import { TaskBaseModule } from "app/components/task/base";


import {
} from "app/components/pool/action";

const components = [
    MarketHomeComponent,
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
