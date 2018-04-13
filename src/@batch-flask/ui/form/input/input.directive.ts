/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import { coerceBooleanProperty } from "@angular/cdk/coercion";
import {
    Directive,
    DoCheck,
    ElementRef,
    HostListener,
    Inject,
    Input,
    NgZone,
    OnChanges,
    OnDestroy,
    OnInit,
    Optional,
    Self,
} from "@angular/core";
import { FormGroupDirective, NgControl, NgForm } from "@angular/forms";
import { FormFieldControl } from "@batch-flask/ui/form/form-field";
import { Subject } from "rxjs";

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

/** Directive that allows a native input to work inside a `MatFormField`. */
@Directive({
    selector: `input[blInput], textarea[blInput]`,
    providers: [{ provide: FormFieldControl, useExisting: InputDirective }],
})
export class InputDirective implements FormFieldControl<any>, OnChanges, OnDestroy, DoCheck {

    /** The aria-describedby attribute on the input for improved a11y. */
    public _ariaDescribedby: string;

    /**
     * Implemented as part of MatFormFieldControl.
     * @docs-private
     */
    public focused: boolean = false;

    /**
     * Implemented as part of MatFormFieldControl.
     * @docs-private
     */
    public readonly stateChanges: Subject<void> = new Subject<void>();

    /**
     * Implemented as part of MatFormFieldControl.
     * @docs-private
     */
    public controlType: string = "mat-input";

    /**
     * Implemented as part of MatFormFieldControl.
     * @docs-private
     */
    public autofilled = false;

    /**
     * Implemented as part of MatFormFieldControl.
     * @docs-private
     */
    @Input()
    public get disabled(): boolean {
        if (this.ngControl && this.ngControl.disabled !== null) {
            return this.ngControl.disabled;
        }
        return this._disabled;
    }
    public set disabled(value: boolean) {
        this._disabled = coerceBooleanProperty(value);

        // Browsers may not fire the blur event if the input is disabled too quickly.
        // Reset from here to ensure that the element doesn't become stuck.
        if (this.focused) {
            this.focused = false;
            this.stateChanges.next();
        }
    }

    /**
     * Implemented as part of MatFormFieldControl.
     * @docs-private
     */
    @Input()
    get id(): string { return this._id; }
    set id(value: string) { this._id = value || this._uid; }

    @Input() public placeholder: string;

    /**
     * Implemented as part of MatFormFieldControl.
     * @docs-private
     */
    @Input()
    public get required(): boolean { return this._required; }
    public set required(value: boolean) { this._required = coerceBooleanProperty(value); }

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

    /**
     * Implemented as part of MatFormFieldControl.
     * @docs-private
     */
    @Input()
    public get value(): string { return this._inputValueAccessor.value; }
    public set value(value: string) {
        if (value !== this.value) {
            this._inputValueAccessor.value = value;
            this.stateChanges.next();
        }
    }

    /** Whether the element is readonly. */
    @Input()
    public get readonly(): boolean { return this._readonly; }
    public set readonly(value: boolean) { this._readonly = coerceBooleanProperty(value); }

    protected _required = false;
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
    protected _uid = `mat-input-${nextUniqueId++}`;
    protected _previousNativeValue: any;
    private _readonly = false;
    private _inputValueAccessor: { value: any };

    constructor(
        protected _elementRef: ElementRef,
        @Optional() @Self() public ngControl: NgControl,
        @Optional() _parentForm: NgForm,
        @Optional() _parentFormGroup: FormGroupDirective,
        ngZone: NgZone) {
        // If no input value accessor was explicitly specified, use the element as the input value
        // accessor.
        this._inputValueAccessor = this._elementRef.nativeElement;

        this._previousNativeValue = this.value;

        // Force setter to be called in case id was not specified.
        this.id = this.id;
    }

    public ngOnChanges() {
        this.stateChanges.next();
    }

    public ngOnDestroy() {
        this.stateChanges.complete();
    }

    public ngDoCheck() {
        if (this.ngControl) {
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

    /** Callback for the cases where the focused state of the input changes. */
    public _focusChanged(isFocused: boolean) {
        if (isFocused !== this.focused && !this.readonly) {
            this.focused = isFocused;
            this.stateChanges.next();
        }
    }

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

    public get empty(): boolean {
        return !this._isNeverEmpty() && !this._elementRef.nativeElement.value && !this._isBadInput() &&
            !this.autofilled;
    }

    public setDescribedByIds(ids: string[]) {
        this._ariaDescribedby = ids.join(" ");
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

}
