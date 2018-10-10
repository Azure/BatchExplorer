import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { BrowserModule } from "@angular/platform-browser";
import { ButtonsModule } from "@batch-flask/ui/buttons";
import { CardModule } from "@batch-flask/ui/card";
import { EditorModule } from "@batch-flask/ui/editor";
import { LoadingModule } from "@batch-flask/ui/loading";
import { CodeFileViewerComponent } from "./code-file-viewer";
import { FileDialogViewerComponent } from "./file-dialog-viewer/file-dialog-viewer.component";
import { FileTooLargeComponent } from "./file-too-large";
import { FileTypeAssociationService } from "./file-type-association";
import { FileViewerContainerComponent } from "./file-viewer-container";
import { ImageFileViewerComponent } from "./image-file-viewer";
import { LogFileViewerComponent } from "./log-file-viewer";

const publicComponents = [
    FileViewerContainerComponent,
    FileTooLargeComponent,
    LogFileViewerComponent,
    ImageFileViewerComponent,
    CodeFileViewerComponent,
    FileDialogViewerComponent,
];

@NgModule({
    declarations: [...publicComponents],
    exports: [...publicComponents],
    imports: [BrowserModule, FormsModule, ReactiveFormsModule, CardModule, ButtonsModule, LoadingModule, EditorModule],
    entryComponents: [
        FileDialogViewerComponent,
        LogFileViewerComponent,
        ImageFileViewerComponent,
        CodeFileViewerComponent,
    ],
    providers: [
        FileTypeAssociationService,
    ],
})
export class FileViewerModule {

}
