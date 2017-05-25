import { Directive } from "@angular/core";
import { FormControl, NG_VALIDATORS } from "@angular/forms";

// note: unsure if this needs to be a directive ....
@Directive({
    selector: "[bl_validateRange][ngModel],[bl_validateRange][formControl]",
    providers: [
        { provide: NG_VALIDATORS, useExisting: RangeValidatorDirective, multi: true },
    ],
})
export class RangeValidatorDirective {
    public validator: (control: FormControl) => any;

    constructor(rangeStart: number, rangeEnd: number) {
        this.validator = ((control: FormControl) => {
            return control.value && (control.value < rangeStart || control.value > rangeEnd)
                ? {
                    validateRange: {
                        valid: false,
                    },
                }
                : null;
        });
    }
}
