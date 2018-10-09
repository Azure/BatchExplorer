import { NgModule } from "@angular/core";
import { commonModules } from "app/common";
import { DataSharedModule } from "app/components/data/shared";
import { JobActionModule } from "app/components/job/action";
import { ChooseActionComponent } from "app/components/market/application-action";
import { MarketComponent } from "app/components/market/home";
import {
    ParameterInputComponent, SubmitMarketApplicationComponent, SubmitNcjTemplateComponent,
} from "app/components/market/submit";

import { TaskBaseModule } from "app/components/task/base";
import { RecentTemplateListComponent } from "./home/recent-template-list";
import { LocalTemplateExplorerModule } from "./local-template-explorer";
import { SubmitLocalTemplateComponent } from "./submit-local-template";
import { SubmitRecentTemplateComponent } from "./submit-recent-template";

const components = [
    ChooseActionComponent,
    MarketComponent,
    SubmitMarketApplicationComponent,
    SubmitRecentTemplateComponent,
    SubmitNcjTemplateComponent,
    ParameterInputComponent,
    SubmitLocalTemplateComponent,
    RecentTemplateListComponent,
];

const modules = [
    TaskBaseModule, JobActionModule, DataSharedModule, ...commonModules,
];

@NgModule({
    declarations: components,
    exports: [...modules, ...components],
    imports: [...modules, LocalTemplateExplorerModule],
    entryComponents: [
    ],
})
export class MarketModule {
}
