import {
    AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter,
    HostListener, Input, Output, ViewChild, forwardRef,
} from "@angular/core";
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from "@angular/forms";
import "app/utils/autoscale";
import * as CodeMirror from "codemirror";
import "codemirror/addon/display/autorefresh";
import "codemirror/addon/display/placeholder";
import "codemirror/addon/hint/show-hint";

@Component({
    selector: "bl-editor",
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            // tslint:disable-next-line:no-forward-ref
            useExisting: forwardRef(() => EditorComponent),
            multi: true,
        }],
    template: `
        <textarea #host placeholder="enter autoscale formula" placeholder="Please enter {{label}}">
        </textarea>
        <div class="mat-input-underline">
            <span class="mat-input-ripple" [class.mat-focused]="isFocused"></span>
        </div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
})

export class EditorComponent implements ControlValueAccessor, AfterViewInit {
    @Input()
    public config;
    @Input()
    public label: string;
    @Output()
    public change = new EventEmitter();
    @Output()
    public focus = new EventEmitter();
    @Output()
    public blur = new EventEmitter();

    @ViewChild("host")
    public host;

    @Output()
    public instance = null;
    public isFocused = false;
    private _value = "";

    get value() { return this._value; };

    @Input() set value(v) {
        if (v !== this._value) {
            this._value = v;
            this.onChange(v);
        }
    }

    constructor(private changeDetector: ChangeDetectorRef) { }

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
                this.instance.showHint({ hint: CodeMirror.hint.autoscale, completeSingle: false });
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
    }

    public updateValue(value) {
        this.value = value;
        this.change.emit(value);
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

    public onChange: Function = () => null;

    // tslint:disable-next-line:no-empty
    public onTouched() { }
    public registerOnChange(fn) { this.onChange = fn; }
    public registerOnTouched(fn) { this.onTouched = fn; }
}
