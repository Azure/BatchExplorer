import { Component, Input, OnChanges } from "@angular/core";
import { AbstractControl, ControlContainer, FormGroupDirective } from "@angular/forms";

@Component({
    selector: "bl-error",
    template: `<div *ngIf="hasError"><ng-content></ng-content></div>`,
})
export class FormErrorComponent implements OnChanges {

    /**
     * Name of the control.
     * Should be the same name used on the input with formControlName
     */
    @Input()
    public controlName: string;

    /**
     * Error code. If specified this will only show if for the given error code.
     */
    @Input()
    public code: string = null;

    private _control: AbstractControl;

    constructor(private formGroup: FormGroupDirective, private parent: ControlContainer) {
    }

    public ngOnChanges(inputs) {
        if (inputs.controlName) {
            this._control = this.retrieveControl();
        }
    }

    public get path(): string[] { return [...this.parent.path, this.controlName]; }

    public retrieveControl(): AbstractControl {
        let current: AbstractControl = this.formGroup.control;
        for (let segment of this.path) {
            current = current.get(segment);
            if (!current) {
                throw new Error(`Path ${this.path} for bl-error is invalid,`
                    + ` there is no control with name '${segment}'`);
            }
        }
        return current;
    }

    /**
     * Check if this formControl has an error and has been touched
     */
    public get hasError(): boolean {
        const control = this._control;
        return control.hasError(this.code) && control.touched;
    }
}
