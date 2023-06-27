import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { ButtonsModule } from "@batch-flask/ui/buttons";
import { FormModule } from "@batch-flask/ui/form";
import { DownloadFolderComponent } from "./download-folder-dialog";
import { FileExplorerModule } from "./file-explorer";
import { FileViewerModule } from "./file-viewer";

const privateComponents = [];
const publicComponents = [
    DownloadFolderComponent,
];

const publicModules = [
    FileViewerModule,
    FileExplorerModule,
];

@NgModule({
    declarations: [...privateComponents, ...publicComponents],
    exports: [...publicModules, ...publicComponents],
    imports: [FormModule, FormsModule, ReactiveFormsModule,  ButtonsModule, ...publicModules],
    entryComponents: [
        DownloadFolderComponent,
    ],
})
export class FileModule {
}
