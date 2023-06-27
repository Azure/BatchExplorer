import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FileExplorerModule, FileModule } from "@batch-flask/ui";
import { NodeFileBrowseComponent } from "./node-file-browse.component";

const components = [
    NodeFileBrowseComponent,
];

const publicModules = [
];
@NgModule({
    declarations: components,
    exports: [...components, ...publicModules],
    imports: [
        CommonModule,
        FileModule,
        FileExplorerModule,
        ...publicModules,
    ],
})
export class FileBrowseModule {

}
