import {
    Directive,
    DoCheck,
    ElementRef,
    HostBinding,
    HostListener,
    Input,
    NgZone,
    OnChanges,
    OnDestroy,
    Optional,
    Self,
} from "@angular/core";
import { FormControl, FormGroupDirective, NgControl, NgForm } from "@angular/forms";
import { FlagInput, coerceBooleanProperty } from "@batch-flask/core";
import { FormFieldControl } from "@batch-flask/ui/form/form-field";
import { Subject } from "rxjs";

import "./input.scss";

// Invalid input type. You should use the corresponding component for those
const INPUT_INVALID_TYPES = [
    "button",
    "checkbox",
    "file",
    "hidden",
    "image",
    "radio",
    "range",
    "reset",
    "submit",
];

let nextUniqueId = 0;

@Directive({
    selector: `input[blInput], textarea[blInput]`,
    providers: [{ provide: FormFieldControl, useExisting: InputDirective }],
})
export class InputDirective implements FormFieldControl<any>, OnChanges, OnDestroy, DoCheck {
    @HostBinding("class.bl-invalid")
    public invalid: boolean;

    /** The aria-describedby attribute on the input for improved a11y. */
    @HostBinding("attr.aria-describedby")
    public ariaDescribedby: string;

    public readonly stateChanges = new Subject<void>();
    public readonly controlType: string = "bl-input";

    @Input()
    public get disabled(): boolean {
        if (this.ngControl && this.ngControl.disabled !== null) {
            return this.ngControl.disabled;
        }
        return this._disabled;
    }
    public set disabled(value: boolean) {
        this._disabled = coerceBooleanProperty(value);
    }

    @Input()
    get id(): string { return this._id; }
    set id(value: string) { this._id = value || this._uid; }

    @Input()
    @HostBinding("attr.aria-label")
    public placeholder: string;

    @Input() @FlagInput() public required = false;

    /** Input type of the element. */
    @Input()
    public get type(): string { return this._type; }
    public set type(value: string) {
        this._type = value || "text";
        this._validateType();

        // When using Angular inputs, developers are no longer able to set the properties on the native
        // input element. To ensure that bindings for `type` work, we need to sync the setter
        // with the native property. Textarea elements don't support the type property or attribute.
        if (!this._isTextarea()) {
            this._elementRef.nativeElement.type = this._type;
        }
    }

    @Input()
    public get value(): string { return this._inputValueAccessor.value; }
    public set value(value: string) {
        if (value !== this.value) {
            this._inputValueAccessor.value = value;
            this.stateChanges.next();
        }
    }

    /** Whether the element is readonly. */
    @Input() @FlagInput() public readonly = false;

    protected _type = "text";
    protected _neverEmptyInputTypes = [
        "date",
        "datetime",
        "datetime-local",
        "month",
        "time",
        "week",
    ];
    protected _disabled = false;
    protected _id: string;
    protected _uid = `bl-input-${nextUniqueId++}`;
    protected _previousNativeValue: any;
    private _inputValueAccessor: { value: any };

    constructor(
        protected _elementRef: ElementRef,
        @Optional() @Self() public ngControl: NgControl,
        @Optional() private _parentForm: NgForm,
        @Optional() private _parentFormGroup: FormGroupDirective,
        ngZone: NgZone) {
        // If no input value accessor was explicitly specified, use the element as the input value
        // accessor.
        this._inputValueAccessor = this._elementRef.nativeElement;

        this._previousNativeValue = this.value;

        // Force setter to be called in case id was not specified.
        this.id = this.id;
    }

    public ngOnChanges() {
        console.log("Change", this.placeholder);
        this.stateChanges.next();
    }

    public ngOnDestroy() {
        this.stateChanges.complete();
    }

    public ngDoCheck() {
        if (this.ngControl) {
            this._computeErrorState();
            // We need to re-evaluate this on every change detection cycle, because there are some
            // error triggers that we can't subscribe to (e.g. parent form submissions). This means
            // that whatever logic is in here has to be super lean or we risk destroying the performance.
        }

        // We need to dirty-check the native element's value, because there are some cases where
        // we won't be notified when it changes (e.g. the consumer isn't using forms or they're
        // updating the value using `emitEvent: false`).
        this._dirtyCheckNativeValue();
    }

    /** Focuses the input. */
    public focus(): void { this._elementRef.nativeElement.focus(); }

    @HostListener("input")
    public _onInput() {
        // This is a noop function and is used to let Angular know whenever the value changes.
        // Angular will run a new change detection each time the `input` event has been dispatched.
        // It's necessary that Angular recognizes the value change, because when floatingLabel
        // is set to false and Angular forms aren't used, the placeholder won't recognize the
        // value changes and will not disappear.
        // Listening to the input event wouldn't be necessary when the input is using the
        // FormsModule or ReactiveFormsModule, because Angular forms also listens to input events.
    }

    public setDescribedByIds(ids: string[]) {
        this.ariaDescribedby = ids.join(" ");
    }

    public onContainerClick() {
        this.focus();
    }

    /** Does some manual dirty checking on the native input `value` property. */
    protected _dirtyCheckNativeValue() {
        const newValue = this.value;

        if (this._previousNativeValue !== newValue) {
            this._previousNativeValue = newValue;
            this.stateChanges.next();
        }
    }

    /** Make sure the input is a supported type. */
    protected _validateType() {
        if (INPUT_INVALID_TYPES.indexOf(this._type) > -1) {
            throw new Error(`Invalid input type for input component: ${this._type}.`
                + `Use the corresponding component for this one`);
        }
    }

    /** Checks whether the input type is one of the types that are never empty. */
    protected _isNeverEmpty() {
        return this._neverEmptyInputTypes.indexOf(this._type) > -1;
    }

    /** Checks whether the input is invalid based on the native validation. */
    protected _isBadInput() {
        // The `validity` property won't be present on platform-server.
        const validity = (this._elementRef.nativeElement as HTMLInputElement).validity;
        return validity && validity.badInput;
    }

    /** Determines if the component host is a textarea. */
    protected _isTextarea() {
        return this._elementRef.nativeElement.nodeName.toLowerCase() === "textarea";
    }

    private _computeErrorState() {
        const parent = this._parentFormGroup || this._parentForm;
        const control = this.ngControl ? this.ngControl.control as FormControl : null;
        this.invalid = this._isInErrorState(control, parent);
    }

    private _isInErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
        return !!(control && control.invalid && (control.touched || (form && form.submitted)));
    }
}
