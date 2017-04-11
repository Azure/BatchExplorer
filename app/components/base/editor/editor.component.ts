import { AfterViewInit, Component, EventEmitter, Input, Output, ViewChild, forwardRef } from "@angular/core";
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from "@angular/forms";
import "app/utils/autoscale";
import * as CodeMirror from "codemirror";
import "codemirror/addon/display/autorefresh";
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
    template: `<textarea #host></textarea>`,
})

export class EditorComponent implements ControlValueAccessor, AfterViewInit {
    @Input()
    public config;
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

    private _value = "";

    get value() { return this._value; };

    @Input() set value(v) {
        if (v !== this._value) {
            this._value = v;
            this.onChange(v);
        }
    }

    public ngAfterViewInit() {
        this.config = this.config || {};
        this.codemirrorInit(this.config);
    }

    public codemirrorInit(config) {
        this.instance = CodeMirror.fromTextArea(this.host.nativeElement, config);
        this.instance.setValue(this._value);

        this.instance.on("change", () => {
            this.updateValue(this.instance.getValue());
        });

        this.instance.on("focus", () => {
            this.focus.emit();
        });

        this.instance.on("blur", () => {
            this.blur.emit();
        });

        this.instance.on("change", (editor, change) => {
            if (change.origin !== "complete" && change.origin !== "setValue") {
                this.instance.showHint({ hint: CodeMirror.hint.autoscale, completeSingle: false });
            }
        });
    }

  public updateValue(value) {
    this.value = value;
    this.onTouched();
    this.change.emit(value);
  }

  public writeValue(value) {
    this._value = value || "";
    if (this.instance) {
        this.instance.setValue(this._value);
    }
  }
  // tslint:disable-next-line:no-empty
  public onChange(_) { }
  // tslint:disable-next-line:no-empty
  public onTouched() { }
  public registerOnChange(fn) { this.onChange = fn; }
  public registerOnTouched(fn) { this.onTouched = fn; }
}
