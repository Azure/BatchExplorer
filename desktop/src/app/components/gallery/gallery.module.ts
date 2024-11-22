import { NgModule } from "@angular/core";
import { FileTypeAssociationService } from "@batch-flask/ui/file/file-viewer/file-type-association";
import { commonModules } from "app/common";
import { DataSharedModule } from "app/components/data/shared";
import { JobActionModule } from "app/components/job/action";
import { TaskBaseModule } from "app/components/task/base";
import { GalleryRoutingModule } from "./gallery-routing.module";
import { GalleryComponent } from "./home";

const components = [
    GalleryComponent,
];

const modules = [
    TaskBaseModule, JobActionModule, DataSharedModule, ...commonModules,
];

@NgModule({
    declarations: components,
    exports: [...modules, ...components],
    imports: [...modules, GalleryRoutingModule],
})
export class GalleryModule {}
