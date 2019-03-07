import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from "@angular/core";
import { DialogService, FileViewer } from "@batch-flask/ui";
import { EditorConfig } from "@batch-flask/ui/editor";
import { LoadingStatus } from "@batch-flask/ui/loading";
import { Observable, Subscription } from "rxjs";
import { SubmitLocalTemplateComponent } from "../submit-local-template";

import "./ncj-template-viewer.scss";

@Component({
    selector: "bl-ncj-template-viewer",
    templateUrl: "ncj-template-viewer.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NcjTemplateViewerComponent extends FileViewer {
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

    private _contentSub: Subscription;

    constructor(private dialogService: DialogService, changeDetector: ChangeDetectorRef) {
        super(changeDetector);
    }

    public onFileLoaderChanges() {
        this.loadingStatus = LoadingStatus.Loading;
        this._loadContent();
        this._computeEditorOptions();
    }

    public onFileChanges() {
        this._loadContent();
    }

    public save(): Observable<any> {
        return this.fileLoader.write(this.value);
    }

    private _loadContent() {
        if (!this.fileLoader) { return; }
        this._cleanupSub();
        this._contentSub = this.fileLoader.content().subscribe((result) => {
            this.value = result.content.toString();
            this.loadingStatus = LoadingStatus.Ready;
            this.changeDetector.markForCheck();
        });
    }

    private async _computeEditorOptions() {
        const {Uri} = await import("monaco-editor");
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

    private _cleanupSub() {
        if (this._contentSub) {
            this._contentSub.unsubscribe();
        }
    }
}
