import { NgModule } from "@angular/core";

import { FileDetailsModule } from "./details";
import { DownloadFolderComponent } from "./download-folder-dialog";
import { FileDialogViewerComponent } from "./file-dialog-viewer";
import { FileDialogService } from "./file-dialog.service";
import { FileExplorerModule } from "./file-explorer";

const privateComponents = [];
const publicComponents = [
    FileDialogViewerComponent,
    DownloadFolderComponent,
];

const modules = [
    FileDetailsModule,
    FileExplorerModule,
];

@NgModule({
    declarations: [...privateComponents, ...publicComponents],
    exports: [...modules, ...publicComponents],
    imports: [...modules],
    providers: [
        FileDialogService,
    ],
    entryComponents: [
        FileDialogViewerComponent,
        DownloadFolderComponent,
    ],
})
export class FileModule {
}
