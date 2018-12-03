import { NgModule } from "@angular/core";
import { FileTypeAssociationService } from "@batch-flask/ui/file/file-viewer/file-type-association";
import { commonModules } from "app/common";
import { DataSharedModule } from "app/components/data/shared";
import { JobActionModule } from "app/components/job/action";
import { TaskBaseModule } from "app/components/task/base";
import { FileGroupCreateModule } from "../data/action/add";
import { ChooseActionComponent } from "./application-action";
import { GalleryApplicationListComponent } from "./application-list";
import { GalleryRoutingModule } from "./gallery-routing.module";
import { GalleryComponent } from "./home";
import { RecentTemplateListComponent } from "./home/recent-template-list";
import { LocalTemplateExplorerModule } from "./local-template-explorer";
import { NcjTemplateViewerComponent } from "./ncj-template-viewer";
import {
    ParameterInputComponent,
    SubmitMarketApplicationComponent,
    SubmitNcjTemplateComponent,
} from "./submit";
import { SubmitLocalTemplateComponent } from "./submit-local-template";
import { SubmitRecentTemplateComponent } from "./submit-recent-template";

const components = [
    ChooseActionComponent,
    GalleryComponent,
    SubmitMarketApplicationComponent,
    SubmitRecentTemplateComponent,
    SubmitNcjTemplateComponent,
    ParameterInputComponent,
    SubmitLocalTemplateComponent,
    RecentTemplateListComponent,
    NcjTemplateViewerComponent,
    GalleryApplicationListComponent,
];

const modules = [
    TaskBaseModule, JobActionModule, DataSharedModule, FileGroupCreateModule, ...commonModules,
];

@NgModule({
    declarations: components,
    exports: [...modules, ...components],
    imports: [...modules, LocalTemplateExplorerModule, GalleryRoutingModule],
    entryComponents: [
        NcjTemplateViewerComponent,
        SubmitLocalTemplateComponent,
        SubmitMarketApplicationComponent,
        SubmitRecentTemplateComponent,
    ],
})
export class GalleryModule {
    constructor(fileAssociationService: FileTypeAssociationService) {
        fileAssociationService.registerViewer({
            name: "ncj-template",
            component: NcjTemplateViewerComponent,
            extensions: [
                ".template.json",
            ],
        });
    }
}
