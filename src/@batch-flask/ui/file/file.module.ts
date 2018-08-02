import { NgModule } from "@angular/core";

import { commonModules } from "app/common";
import { FileDetailsModule } from "./details";
import { FileDialogService } from "./file-dialog.service";

const components = [];

const modules = [
    FileDetailsModule,
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
