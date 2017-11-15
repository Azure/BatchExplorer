import {
    AfterViewInit, ChangeDetectionStrategy, Component, ElementRef,
    EventEmitter, HostListener, Input, OnChanges, OnDestroy, Output, ViewChild, forwardRef,
} from "@angular/core";
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from "@angular/forms";
import { MonacoLoader } from "app/services";
import * as elementResizeDetectorMaker from "element-resize-detector";
import "./editor.scss";

export interface EditorKeyBinding {
    key: any;
    action: any;
}

export interface EditorConfig extends monaco.editor.IEditorConstructionOptions {
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
            // tslint:disable-next-line:no-forward-ref
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

    get value() { return this._value; }

    @Input() set value(v) {
        if (v !== this._value) {
            this.writeValue(v);
        }
    }

    constructor(
        private elementRef: ElementRef,
        private monacoLoader: MonacoLoader) { }

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

        this.monacoLoader.get().then((monaco) => {
            this.initMonaco();
        });

        this.config = this.config || {};
    }

    public ngOnDestroy() {
        this._resizeDetector.uninstall(this.elementRef.nativeElement);
    }

    public initMonaco() {
        const myDiv: HTMLDivElement = this.editorContent.nativeElement;
        const options: monaco.editor.IEditorConstructionOptions = this.config;

        options.value = this._value;

        this._editor = monaco.editor.create(myDiv, options);
        if (this.config.tabSize) {
            this._editor.getModel().updateOptions({ tabSize: this.config.tabSize });
        }

        if (this.config.keybindings) {
            for (const binding of this.config.keybindings) {
                this._editor.addCommand(binding.key, binding.action, "");
            }
        }
        this._editor.getModel().onDidChangeContent((e) => {
            this.updateValue(this._editor.getModel().getValue());
        });
    }

    public updateValue(value) {
        this._value = value;
        this.change.emit(value);
        this.onChange(value);
    }

    public writeValue(value) {
        this._value = value || "";
        if (this._editor) {
            this._editor.getModel().setValue(this._value);
        }
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
