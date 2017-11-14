import {
    AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef,
    EventEmitter, HostListener, Input, OnChanges, OnDestroy, Output, ViewChild, forwardRef,
} from "@angular/core";
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from "@angular/forms";
import * as CodeMirror from "codemirror";
import * as elementResizeDetectorMaker from "element-resize-detector";
import { Observable, Subscription } from "rxjs";

import "codemirror/addon/comment/comment";
import "codemirror/addon/display/autorefresh";
import "codemirror/addon/display/placeholder";
import "codemirror/addon/hint/show-hint";

// Modes
import "app/utils/autoscale";
import "codemirror/mode/javascript/javascript";

import "./editor.scss";

declare const monaco: any;
(CodeMirror as any).keyMap.default["Shift-Tab"] = "indentLess";
(CodeMirror as any).keyMap.default["Ctrl-/"] = "toggleComment";

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
    @Input() public config: CodeMirror.EditorConfiguration;
    @Input() public label: string;

    @Output() public change = new EventEmitter();
    @Output() public focus = new EventEmitter();
    @Output() public blur = new EventEmitter();

    @ViewChild("editor") public editorContent: ElementRef;

    @ViewChild("host")
    public host;

    public instance: CodeMirror.EditorFromTextArea = null;
    public isFocused = false;
    public placeholder: string;
    private _value = "";
    private _sub: Subscription;
    private _resizeDetector: any;
    private _editor: any;

    get value() { return this._value; }

    @Input() set value(v) {
        if (v !== this._value) {
            this.writeValue(v);
        }
    }

    constructor(private changeDetector: ChangeDetectorRef, private elementRef: ElementRef) { }

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
            // this.instance.refresh();
        });

        const onGotAmdLoader = () => {
            console.log("window", (window as any).amdRequire);

            (window as any).amdRequire.config({ paths: { vs: "vendor/vs" } });
            (window as any).amdRequire(["vs/editor/editor.main"], () => {
                this.initMonaco();
            });
        };

        // Load AMD loader if necessary
        if (!(window as any).amdRequire) {
            const nodeRequire = (window as any).require;
            let loaderScript = document.createElement("script");
            loaderScript.type = "text/javascript";
            loaderScript.src = "vendor/vs/loader.js";
            loaderScript.addEventListener("load", () => {
                (window as any).amdRequire = (window as any).require;
                (window as any).require = nodeRequire;
                onGotAmdLoader();
            });
            document.body.appendChild(loaderScript);
        } else {
            onGotAmdLoader();
        }

        this.config = this.config || {};
        if (!this.config.extraKeys) {
            this.config.extraKeys = {};
        }

        // this.codemirrorInit(this.config);
    }

    public ngOnDestroy() {
        this._sub.unsubscribe();
        this._resizeDetector.uninstall(this.elementRef.nativeElement);
    }

    public initMonaco() {
        const myDiv: HTMLDivElement = this.editorContent.nativeElement;
        let options: any = this.config;
        options.value = this._value;
        options.language = "javascript";

        this._editor = monaco.editor.create(myDiv, options);

        this._editor.getModel().onDidChangeContent((e) => {
            this.updateValue(this._editor.getModel().getValue());
        });
    }

    public codemirrorInit(config) {
        this.instance = CodeMirror.fromTextArea(this.host.nativeElement, config);
        this.instance.setValue(this._value);
        this.instance.on("change", (editor, change) => {
            this.updateValue(this.instance.getValue());

            if (change.origin !== "complete" && change.origin !== "setValue") {
                const hint = (CodeMirror as any).hint[this.instance.getDoc().getMode().name];
                if (hint) {
                    (this.instance as any).showHint({ hint: hint, completeSingle: false });
                }
            }
        });

        this.instance.on("focus", () => {
            this.isFocused = true;
            this.focus.emit();
            this.onTouched();
            this.changeDetector.markForCheck();
        });

        this.instance.on("blur", () => {
            this.isFocused = false;
            this.blur.emit();
            this.changeDetector.markForCheck();
        });

        this._sub = Observable.timer(200).subscribe(() => {
            this.instance.refresh();
        });
    }

    public updateValue(value) {
        this._value = value;
        this.change.emit(value);
        this.onChange(value);
    }

    public writeValue(value) {
        this._value = value || "";
        if (this.instance) {
            this.instance.setValue(this._value);
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
