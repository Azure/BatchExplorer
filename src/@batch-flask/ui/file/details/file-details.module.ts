import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { BrowserModule } from "@angular/platform-browser";
import { ButtonsModule } from "@batch-flask/ui/buttons";
import { CardModule } from "@batch-flask/ui/card";
import { EditorModule } from "@batch-flask/ui/editor";
import { LoadingModule } from "@batch-flask/ui/loading";
import { CodeFileViewerComponent } from "./code-file-viewer";
import { FileContentComponent } from "./file-content.component";
import { FileDetailsViewComponent } from "./file-details-view";
import { FileTooLargeComponent } from "./file-too-large";
import { ImageFileViewerComponent } from "./image-file-viewer";
import { LogFileViewerComponent } from "./log-file-viewer";

const components = [
    FileContentComponent,
    FileDetailsViewComponent,
    FileTooLargeComponent,
    LogFileViewerComponent,
    ImageFileViewerComponent,
    CodeFileViewerComponent,
];

@NgModule({
    declarations: components,
    exports: components,
    imports: [BrowserModule, FormsModule, ReactiveFormsModule, CardModule, ButtonsModule, LoadingModule, EditorModule],
})
export class FileDetailsModule {

}
