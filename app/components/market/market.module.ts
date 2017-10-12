import { NgModule } from "@angular/core";
import { commonModules } from "app/common";
import { DataSharedModule } from "app/components/data/shared";
import { JobActionModule } from "app/components/job/action";
import { ChooseActionComponent } from "app/components/market/application-action";
import { MarketComponent } from "app/components/market/home";
import {
    ParameterInputComponent, SubmitMarketApplicationComponent, SubmitNcjTemplateComponent,
} from "app/components/market/submit";

import { LocalTemplateBrowserComponent } from "app/components/market/local-template-browser";
import { SubmitLocalTemplateComponent } from "app/components/market/submit-local-template";
import { TaskBaseModule } from "app/components/task/base";

const components = [
    ChooseActionComponent,
    MarketComponent,
    SubmitMarketApplicationComponent,
    SubmitNcjTemplateComponent,
    ParameterInputComponent,
    LocalTemplateBrowserComponent,
    SubmitLocalTemplateComponent,
];

const modules = [
    TaskBaseModule, JobActionModule, DataSharedModule, ...commonModules,
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
