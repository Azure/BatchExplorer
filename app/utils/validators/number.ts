import { AbstractControl, ValidatorFn, Validators } from "@angular/forms";
import { isPresent } from "common/utils/object-utils";

/**
 * Validator that requires controls to have a value of a min value.
 */
export function min(val: number): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } => {
        if (isPresent(Validators.required(control))) { return null; }

        let v: number = control.value;
        return v >= val ? null : { min: true };
    };
}

/**
 * Validator that requires controls to have a value of a max value.
 */
export function max(val: number): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } => {
        if (isPresent(Validators.required(control))) { return null; }

        let v: number = control.value;
        return v <= val ? null : { max: true };
    };
}

/**
 * Validator that requires controls to have a value of number.
 */
export function number(control: AbstractControl): { [key: string]: boolean } {
    if (isPresent(Validators.required(control))) { return null; }

    let v: string = control.value;
    return /^(?:-?\d+|-?\d{1,3}(?:,\d{3})+)?(?:\.\d+)?$/.test(v) ? null : { number: true };
}
