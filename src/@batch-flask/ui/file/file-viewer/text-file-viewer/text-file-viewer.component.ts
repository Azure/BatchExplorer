import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from "@angular/core";
import { EditorConfig } from "@batch-flask/ui/editor";
import { LoadingStatus } from "@batch-flask/ui/loading";
import { Observable, Subscription } from "rxjs";
import { FileViewer } from "../file-viewer";

import "./text-file-viewer.scss";

@Component({
    selector: "bl-text-file-viewer",
    templateUrl: "text-file-viewer.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TextFileViewerComponent extends FileViewer {
    public static readonly MAX_FILE_SIZE = 1000000; // 1MB

    public value: string = "";
    public loadingStatus: LoadingStatus = LoadingStatus.Loading;
    public editorConfig: EditorConfig;

    private _diskValue: string = "";
    private _contentSub: Subscription;

    constructor(changeDetector: ChangeDetectorRef) {
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

    public updateValue(value: string) {
        this.value = value;
        this._modified.next(this._diskValue !== value);
        this.changeDetector.markForCheck();
    }

    public save(): Observable<any> {
        console.log("Save");
        this._modified.next(false);
        return this.fileLoader.write(this.value);
    }

    protected async _computeEditorOptions() {
        const { Uri, KeyMod, KeyCode } = await import("monaco-editor");

        this.editorConfig = {
            readOnly: this.fileLoader.isReadonly,
            minimap: {
                enabled: false,
            },
            uri: this.fileLoader && Uri.file(this.fileLoader.filename),
            keybindings: [
                { key: KeyMod.CtrlCmd | KeyCode.KEY_S, action: () => this.save() },
            ],
        };
        this.changeDetector.markForCheck();
    }

    private _loadContent() {
        if (!this.fileLoader) { return; }
        this._cleanupSub();
        this._contentSub = this.fileLoader.content().subscribe((result) => {
            this.value = result.content.toString();
            this._diskValue = this.value;
            this.loadingStatus = LoadingStatus.Ready;
            this.changeDetector.markForCheck();
        });
    }

    private _cleanupSub() {
        if (this._contentSub) {
            this._contentSub.unsubscribe();
        }
    }
}
