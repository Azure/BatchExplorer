import { NgModule } from "@angular/core";
import { commonModules } from "app/common";
import { DataSharedModule } from "app/components/data/shared";
import { JobActionModule } from "app/components/job/action";
import { ChooseActionComponent } from "app/components/market/application-action";
import { MarketComponent } from "app/components/market/home";
import {
    ParameterInputComponent, SubmitMarketApplicationComponent, SubmitNcjTemplateComponent,
} from "app/components/market/submit";

import { FileTypeAssociationService } from "@batch-flask/ui/file/file-viewer/file-type-association";
import { TaskBaseModule } from "app/components/task/base";
import { RecentTemplateListComponent } from "./home/recent-template-list";
import { LocalTemplateExplorerModule } from "./local-template-explorer";
import { NcjTemplateViewerComponent } from "./ncj-template-viewer";
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
    NcjTemplateViewerComponent,
];

const modules = [
    TaskBaseModule, JobActionModule, DataSharedModule, ...commonModules,
];

@NgModule({
    declarations: components,
    exports: [...modules, ...components],
    imports: [...modules, LocalTemplateExplorerModule],
    entryComponents: [
        NcjTemplateViewerComponent,
        SubmitLocalTemplateComponent,
    ],
})
export class MarketModule {
    public constructor(fileAssociationService: FileTypeAssociationService) {
        fileAssociationService.registerViewer({
            name: "ncj-template",
            component: NcjTemplateViewerComponent,
            extensions: [
                ".template.json",
            ],
        });
    }
}
