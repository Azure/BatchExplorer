import {
    AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter,
    HostListener, Input, OnChanges, Output, ViewChild, forwardRef,
} from "@angular/core";
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from "@angular/forms";
import * as CodeMirror from "codemirror";
import "codemirror/addon/display/autorefresh";
import "codemirror/addon/display/placeholder";
import "codemirror/addon/hint/show-hint";

// Modes
import "app/utils/autoscale";
import "codemirror/mode/javascript/javascript";

import "./editor.scss";

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

export class EditorComponent implements ControlValueAccessor, AfterViewInit, OnChanges {
    @Input() public config: CodeMirror.EditorConfiguration;
    @Input() public label: string;

    @Output() public change = new EventEmitter();
    @Output() public focus = new EventEmitter();
    @Output() public blur = new EventEmitter();

    @ViewChild("host")
    public host;

    public instance: CodeMirror.EditorFromTextArea = null;
    public isFocused = false;
    public placeholder: string;
    private _value = "";

    get value() { return this._value; }

    @Input() set value(v) {
        if (v !== this._value) {
            this.writeValue(v);
        }
    }

    constructor(private changeDetector: ChangeDetectorRef) { }

    public ngOnChanges(changes) {
        if (changes.config) {
            this._updatePlaceHolder();
        }
    }
    public ngAfterViewInit() {
        this.config = this.config || {};
        this.codemirrorInit(this.config);
    }

    public codemirrorInit(config) {
        this.instance = CodeMirror.fromTextArea(this.host.nativeElement, config);
        this.instance.setValue(this._value);
        this.instance.on("change", (editor, change) => {
            this.updateValue(this.instance.getValue());

            if (change.origin !== "complete" && change.origin !== "setValue") {
                const hint = (CodeMirror as any).hint[this.instance.getDoc().getMode()];
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

        setTimeout(() => {
            this.instance.refresh();
        }, 200);
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
