import { UntypedFormControl } from "@angular/forms";

export class RangeValidator {
    public validator: (control: UntypedFormControl) => any;

    constructor(rangeStart: number, rangeEnd: number) {
        this.validator = ((control: UntypedFormControl) => {
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
