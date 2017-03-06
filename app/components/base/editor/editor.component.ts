import { Component, ElementRef, EventEmitter, Input, Output } from "@angular/core";
import "brace";

// Themes
import "brace/theme/chrome";

// Languages
import "brace/mode/json";

declare var ace: any;

@Component({
    selector: "bl-editor",
    template: "",
    styles: [":host { display:block;width:100%;min-height: 200px;overflow: auto; }"],
})
export class EditorComponent {
    @Output()
    public textChanged = new EventEmitter();
    @Output()
    public textChange = new EventEmitter();
    @Input()
    public style: any = {};

    private _options: any = {};
    private _readOnly: boolean = false;
    private _theme: string = "chrome";
    private _mode: any = "json";
    private _autoUpdateContent: boolean = true;
    private _editor: any;
    private _durationBeforeCallback: number = 0;
    private _text: string = "";
    private oldText: any;
    private timeoutSaving: any;

    constructor(elementRef: ElementRef) {
        let el = elementRef.nativeElement;
        this._editor = ace["edit"](el);

        this.init();
        this.initEvents();
    }

    public init() {
        this.setOptions(this._options || {});
        this.setTheme(this._theme);
        this.setMode(this._mode);
        this.setReadOnly(this._readOnly);
    }

    public initEvents() {
        this._editor.on("change", () => {
            let newVal = this._editor.getValue();
            if (newVal === this.oldText) {
                return;
            }
            if (typeof this.oldText !== "undefined") {
                if (this._durationBeforeCallback === 0) {
                    this._text = newVal;
                    this.textChange.emit(newVal);
                    this.textChanged.emit(newVal);
                } else {
                    if (this.timeoutSaving != null) {
                        clearTimeout(this.timeoutSaving);
                    }

                    this.timeoutSaving = setTimeout(() => {
                        this._text = newVal;
                        this.textChange.emit(newVal);
                        this.textChanged.emit(newVal);
                        this.timeoutSaving = null;
                    }, this._durationBeforeCallback);
                }
            }
            this.oldText = newVal;
        });
    }

    @Input() set options(options: any) {
        this.setOptions(options);
    }

    public setOptions(options: any) {
        this._options = options;
        this._editor.setOptions(options || {});
    }

    @Input() set readOnly(readOnly: any) {
        this.setReadOnly(readOnly);
    }

    public setReadOnly(readOnly: any) {
        this._readOnly = readOnly;
        this._editor.setReadOnly(readOnly);
    }

    @Input() set theme(theme: any) {
        this.setTheme(theme);
    }

    public setTheme(theme: any) {
        this._theme = theme;
        this._editor.setTheme(`ace/theme/${theme}`);
    }

    @Input() set mode(mode: any) {
        this.setMode(mode);
    }

    public setMode(mode: any) {
        this._mode = mode;
        if (typeof this._mode === "object") {
            this._editor.getSession().setMode(this._mode);
        } else {
            this._editor.getSession().setMode(`ace/mode/${this._mode}`);
        }
    }

    @Input()
    get text() {
        return this._text;
    }

    set text(text: string) {
        this.setText(text);
    }

    public setText(text: any) {
        if (this._text !== text) {
            if (text == null) {
                text = "";
            }
            if (this._autoUpdateContent === true) {
                this._text = text;
                this._editor.setValue(text);
            }
        }
    }

    @Input() set autoUpdateContent(status: any) {
        this.setAutoUpdateContent(status);
    }

    public setAutoUpdateContent(status: any) {
        this._autoUpdateContent = status;
    }

    @Input() set durationBeforeCallback(num: number) {
        this.setDurationBeforeCallback(num);
    }

    public setDurationBeforeCallback(num: number) {
        this._durationBeforeCallback = num;
    }

    public getEditor() {
        return this._editor;
    }
}
