import { FormControl } from "@angular/forms";

export class RangeValidator {
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
