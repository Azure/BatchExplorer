import { NgModule } from "@angular/core";

import { FileDetailsModule } from "./details";
import { FileDialogService } from "./file-dialog.service";
import { FileExplorerModule } from "./file-explorer";

const components = [];

const modules = [
    FileDetailsModule,
    FileExplorerModule,
];

@NgModule({
    declarations: components,
    exports: [...modules],
    imports: [...modules],
    providers: [
        FileDialogService,
    ],
    entryComponents: [
    ],
})
export class FileModule {
}
