import {
    ChangeDetectionStrategy, ChangeDetectorRef, Component,
    Input, OnChanges, OnDestroy, Optional,
} from "@angular/core";
import { AbstractControl, ControlContainer, FormControl, FormGroupDirective } from "@angular/forms";
import { SanitizedError } from "@batch-flask/utils";
import { Subscription } from "rxjs";

let idCounter = 0;
@Component({
    selector: "bl-error",
    template: `<div *ngIf="hasError" [id]="id" role="alert"><ng-content></ng-content></div>`,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormErrorComponent implements OnChanges, OnDestroy {
    @Input() public id = `bl-error-${idCounter++}`;

    /**
     * Form control.
     * Exclusive with controlName
     */
    @Input() public control: FormControl;

    /**
     * Name of the control.
     * Should be the same name used on the input with formControlName
     */
    @Input() public controlName: string;

    /**
     * Error code. If specified this will only show if for the given error code.
     */
    @Input() public code: string = null;

    private _hasError = false;
    private _control: AbstractControl;
    private _sub: Subscription;

    constructor(
        private changeDetector: ChangeDetectorRef,
        @Optional() private formGroup?: FormGroupDirective,
        @Optional() private parent?: ControlContainer,
    ) {
    }

    public ngOnChanges(inputs) {
        if (inputs.controlName || inputs.control) {
            this._control = this.retrieveControl();
        }
        this._listenForChanges();
    }

    public ngOnDestroy() {
        if (this._sub) {
            this._sub.unsubscribe();
        }
    }

    public get path(): string[] { return [...this.parent.path, this.controlName]; }

    public retrieveControl(): AbstractControl {
        if (this.control) { return this.control; }
        let current: AbstractControl = this.formGroup.control;
        for (const segment of this.path) {
            current = current.get(segment);
            if (!current) {
                throw new SanitizedError(`Path ${this.path} for bl-error is invalid,`
                    + ` there is no control with name '${segment}'`);
            }
        }
        return current;
    }

    public get hasError() {
        return this._hasError && (this._control.touched || this._control.dirty);
    }

    /**
     * Check if this formControl has an error and has been touched
     */
    private _computeHasError() {
        const control = this._control;
        if (!control) {
            throw new SanitizedError(`bl-error must have a form control.`
                + `Either set the [control] input or use a form group and set the formControlName`);
        }
        this._hasError = control.hasError(this.code);
        this.changeDetector.markForCheck();
    }

    private _listenForChanges() {
        this._computeHasError();
        if (this._sub) {
            this._sub.unsubscribe();
            this._sub = null;
        }
        this._sub = this._control.statusChanges.subscribe((x) => {
            this._computeHasError();
        });
    }
}
