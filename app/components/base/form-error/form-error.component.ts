import { Component, Input } from "@angular/core";
import { ControlContainer, FormGroupDirective } from "@angular/forms";

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

    public get hasError(): boolean {
        return this.formGroup.hasError(this.code, this.path);
    }
}
