import { NgModule } from "@angular/core";

import { FileDetailsModule } from "./details";
import { FileDialogViewerComponent } from "./file-dialog-viewer";
import { FileDialogService } from "./file-dialog.service";
import { FileExplorerModule } from "./file-explorer";

const privateComponents = [];
const publicComponents = [
    FileDialogViewerComponent,
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
    ],
})
export class FileModule {
}
