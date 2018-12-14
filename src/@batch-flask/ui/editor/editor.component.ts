import {
    AfterViewInit, ChangeDetectionStrategy, Component, ElementRef,
    EventEmitter, HostListener, Input, OnChanges, OnDestroy, Output, ViewChild, forwardRef,
} from "@angular/core";
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from "@angular/forms";
import * as elementResizeDetectorMaker from "element-resize-detector";
import { Uri, editor } from "monaco-editor";
import "./editor.scss";
import { AutoscaleLanguage } from "./monaco-languages";

export interface EditorKeyBinding {
    key: any;
    action: any;
}

export interface EditorConfig extends editor.IEditorConstructionOptions {
    /**
     * Optional filename used for language specific schemas
     */
    uri?: Uri;
    language?: string;
    readOnly?: boolean;
    tabSize?: number;
    keybindings?: EditorKeyBinding[];
}

const defaultConfig = {
};

@Component({
    selector: "bl-editor",
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => EditorComponent),
            multi: true,
        }],
    templateUrl: "editor.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})

export class EditorComponent implements ControlValueAccessor, AfterViewInit, OnChanges, OnDestroy {
    @Input() public set config(config: EditorConfig) {
        this._config = { ...defaultConfig, ...config };
    }
    public get config(): EditorConfig { return this._config; }

    @Input() public label: string;

    @Output() public change = new EventEmitter();
    @Output() public focus = new EventEmitter();
    @Output() public blur = new EventEmitter();

    @ViewChild("editor") public editorContent: ElementRef;

    @ViewChild("host")
    public host;

    public isFocused = false;
    public placeholder: string;
    private _value = "";
    private _resizeDetector: any;
    private _config: EditorConfig;
    private _editor: monaco.editor.IStandaloneCodeEditor;
    private _model: monaco.editor.IModel;
    private _modelChangeSub: monaco.IDisposable;

    @Input() public set value(v) {
        if (v !== this._value) {
            this.writeValue(v);
        }
    }
    public get value() { return this._value; }

    constructor(
        private elementRef: ElementRef) { }

    public ngOnChanges(changes) {
        if (changes.config) {
            this._updatePlaceHolder();
        }
    }
    public ngAfterViewInit() {
        this._resizeDetector = elementResizeDetectorMaker({
            strategy: "scroll",
        });

        this._resizeDetector.listenTo(this.elementRef.nativeElement, (element) => {
            if (this._editor) {
                this._editor.layout();
            }
        });

        this.initMonaco();

        this.config = this.config || {};
    }

    public ngOnDestroy() {
        if (this._editor) {
            this._editor.dispose();
        }
        if (this._modelChangeSub) {
            this._modelChangeSub.dispose();
        }
        if (this._model) {
            this._model.dispose();
        }
        this._model = null;
        this._editor = null;
        this._resizeDetector.uninstall(this.elementRef.nativeElement);
    }

    public async initMonaco() {
        const monaco = await import("monaco-editor");
        AutoscaleLanguage.define();
        const myDiv: HTMLDivElement = this.editorContent.nativeElement;
        const options: monaco.editor.IEditorConstructionOptions = this.config;

        options.value = this._value;

        // Monaco editor model should not be created when model exists.
        // Assign _model to existing model instead of create new one to avoid error
        const uri = this.config.uri as any;
        const model = uri ? monaco.editor.getModel(uri) : null;
        this._model = model || monaco.editor.createModel(this._value || "", this.config.language, uri);
        // Inject this because initMonaco() function is invoked after writeValue()
        // which causes reopen json editor with an incorrect value populated
        this._model.setValue(this._value);

        this._editor = monaco.editor.create(myDiv, { ...this.config as any, model: this._model });

        if (this.config.tabSize) {
            this._model.updateOptions({ tabSize: this.config.tabSize });
        }

        if (this.config.keybindings) {
            for (const binding of this.config.keybindings) {
                this._editor.addCommand(binding.key, binding.action, "");
            }
        }
        this._modelChangeSub = this._model.onDidChangeContent((e) => {
            this.updateValue(this._model.getValue());
        });
    }

    public updateValue(value) {
        this._value = value;
        this.change.emit(value);
        this.onChange(value);
    }

    public writeValue(value) {
        this._value = value || "";
        if (this._model) {
            this._model.setValue(this._value);
        }
    }

    public scrollToEnd() {
        this._editor.setScrollTop(this._editor.getScrollHeight());
    }

    @HostListener("keyup.enter", ["$event"])
    public onEnter(event: KeyboardEvent) {
        // Prevent forms from being submitted when focussed in editor and pressing enter.
        event.stopPropagation();
    }

    public onChange: (value: any) => any = () => null;

    // tslint:disable-next-line:no-empty
    public onTouched() { }
    public registerOnChange(fn) { this.onChange = fn; }
    public registerOnTouched(fn) { this.onTouched = fn; }

    private _updatePlaceHolder() {
        if (!this.label || (this.config && this.config.readOnly)) {
            this.placeholder = "";
        } else {
            this.placeholder = `Please enter ${this.label}`;
        }
    }
}
