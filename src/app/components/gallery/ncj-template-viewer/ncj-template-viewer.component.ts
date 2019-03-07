import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from "@angular/core";
import { DialogService } from "@batch-flask/ui";
import { EditorConfig } from "@batch-flask/ui/editor";
import { TextFileViewerComponent } from "@batch-flask/ui/file/file-viewer/text-file-viewer";
import { LoadingStatus } from "@batch-flask/ui/loading";
import { SubmitLocalTemplateComponent } from "../submit-local-template";

import "./ncj-template-viewer.scss";

@Component({
    selector: "bl-ncj-template-viewer",
    templateUrl: "ncj-template-viewer.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NcjTemplateViewerComponent extends TextFileViewerComponent {
    public static readonly MAX_FILE_SIZE = 1000000; // 1MB

    public value: string = "";
    public loadingStatus: LoadingStatus = LoadingStatus.Loading;
    public editorConfig: EditorConfig;

    public commands = [
        {
            label: "Run",
            icon: "fa fa-play",
            color: "success",
            execute: () => this._executeTemplate(),
        },
    ];

    constructor(private dialogService: DialogService, changeDetector: ChangeDetectorRef) {
        super(changeDetector);
    }

    protected async _computeEditorOptions() {
        const { Uri } = await import("monaco-editor");
        this.editorConfig = {
            readOnly: this.fileLoader.isReadonly,
            minimap: {
                enabled: false,
            },
            language: "json",
            uri: this.fileLoader && Uri.file(this.fileLoader.filename),
        };
    }

    private _executeTemplate() {
        const ref = this.dialogService.open(SubmitLocalTemplateComponent);
        ref.componentInstance.filename = this.fileLoader.filename;
        ref.componentInstance.template = this.value;
    }
}
