import { FormControl } from "@angular/forms";

// TODO-TIM change, remove directive suffix
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
