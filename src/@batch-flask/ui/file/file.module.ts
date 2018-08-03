import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { ButtonsModule } from "@batch-flask/ui/buttons";
import { FormModule } from "@batch-flask/ui/form";
import { DownloadFolderComponent } from "./download-folder-dialog";
import { FileDialogViewerComponent } from "./file-dialog-viewer";
import { FileDialogService } from "./file-dialog.service";
import { FileExplorerModule } from "./file-explorer";
import { FileViewerModule } from "./file-viewer";

const privateComponents = [];
const publicComponents = [
    FileDialogViewerComponent,
    DownloadFolderComponent,
];

const modules = [
    FileViewerModule,
    FileExplorerModule,
    FormModule,
    ReactiveFormsModule,
    FormsModule,
    ButtonsModule,
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
