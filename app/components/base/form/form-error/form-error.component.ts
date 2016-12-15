import { Component, Input } from "@angular/core";
import { AbstractControl, ControlContainer, FormGroupDirective } from "@angular/forms";

@Component({
    selector: "bex-error",
    template: `<div *ngIf="hasError"><ng-content></ng-content></div>`,
})
export class FormErrorComponent {

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

    constructor(private formGroup: FormGroupDirective, private parent: ControlContainer) {
    }

    public get path(): string[] { return [...this.parent.path, this.controlName]; }

    /**
     * Check if this formControl has an error and has been touched
     */
    public get hasError(): boolean {
        let current: AbstractControl = this.formGroup.control;
        for (let segment of this.path) {
            current = current.get(segment);
            if (!current) {
                throw `Path ${this.path} for bex-error is invalid, there is no control with name '${segment}'`;
            }
        }
        return current.hasError(this.code) && current.touched;
    }
}
