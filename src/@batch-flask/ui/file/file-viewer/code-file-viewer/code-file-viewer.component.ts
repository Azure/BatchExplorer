import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from "@angular/core";
import { EditorConfig } from "@batch-flask/ui/editor";
import { LoadingStatus } from "@batch-flask/ui/loading";
import { Uri } from "monaco-editor";
import { FileViewer } from "../file-viewer";

import { Subscription } from "rxjs";
import "./code-file-viewer.scss";

@Component({
    selector: "bl-code-file-viewer",
    templateUrl: "code-file-viewer.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CodeFileViewerComponent extends FileViewer {
    public static readonly MAX_FILE_SIZE = 100000; // 100KB

    public value: string = "";
    public loadingStatus: LoadingStatus = LoadingStatus.Loading;
    public editorConfig: EditorConfig;

    private _contentSub: Subscription;

    constructor(changeDetector: ChangeDetectorRef) {
        super(changeDetector);
    }

    public onFileLoaderChanges() {
        this._loadContent();
        this._computeEditorOptions();
    }

    private _loadContent() {
        this.loadingStatus = LoadingStatus.Loading;
        this.changeDetector.markForCheck();
        this._cleanupSub();
        this._contentSub = this.fileLoader.content().subscribe((result) => {
            this.value = result.content.toString();
            this.loadingStatus = LoadingStatus.Ready;
            this.changeDetector.markForCheck();
        });
    }

    private _computeEditorOptions() {
        this.editorConfig = {
            readOnly: true,
            minimap: {
                enabled: false,
            },
            uri: Uri.file(this.fileLoader.filename),
        };
    }

    private _cleanupSub() {
        if (this._contentSub) {
            this._contentSub.unsubscribe();
        }
    }
}
