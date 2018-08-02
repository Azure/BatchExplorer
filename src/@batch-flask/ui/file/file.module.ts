import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { ButtonsModule } from "@batch-flask/ui/buttons";
import { FormModule } from "@batch-flask/ui/form";
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
