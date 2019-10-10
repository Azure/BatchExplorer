import { Observable } from "rxjs";

/**
 * Add some typing to the angular forms
 */
declare module "@angular/forms/forms" {

    interface FormControl<T = any> {
        readonly valueChanges: Observable<T>;
        readonly value: T;

        new(formState?: T,
            validatorOrOpts?: ValidatorFn | ValidatorFn[] | AbstractControlOptions | null,
            asyncValidator?: AsyncValidatorFn | AsyncValidatorFn[] | null);

        setValue(value: T, options?: {
            onlySelf?: boolean;
            emitEvent?: boolean;
            emitModelToViewChange?: boolean;
            emitViewToModelChange?: boolean;
        }): void;
    }

    interface FormGroup<T = any> {
        readonly valueChanges: Observable<T>;
        readonly value: T;

        new(formState?: T,
            validatorOrOpts?: ValidatorFn | ValidatorFn[] | AbstractControlOptions | null,
            asyncValidator?: AsyncValidatorFn | AsyncValidatorFn[] | null);

        setValue(value: T, options?: {
            onlySelf?: boolean;
            emitEvent?: boolean;
        }): void;
        patchValue(value: Partial<T>, options?: {
            onlySelf?: boolean;
            emitEvent?: boolean;
        }): void;
    }
}
