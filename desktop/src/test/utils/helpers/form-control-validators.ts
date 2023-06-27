import { FormGroup } from "@angular/forms";

export function validateControl(formGroup: FormGroup, controlName: string) {
    return new Validate(formGroup, controlName);
}

class Validate {
    constructor(
        private formGroup: FormGroup,
        private controlName: string) {
    }

    public fails(validator: string): With {
        return new With(this.formGroup, this.controlName, validator, true);
    }

    public passes(validator: string): With {
        return new With(this.formGroup, this.controlName, validator, false);
    }
}

class With {
    constructor(
        private formGroup: FormGroup,
        private controlName: string,
        private validator: string,
        private hasError: boolean) {
    }

    public with(value: any) {
        const control = this.formGroup.controls[this.controlName];
        control.setValue(value);
        const not = this.hasError ? "" : "NOT";
        const errorMessage =
            `Expected ${this.controlName} ${not} to have error ${this.validator} when using value ${value}`;
        expect(this.formGroup.hasError(this.validator, [this.controlName])).toBe(this.hasError, errorMessage);
    }
}
