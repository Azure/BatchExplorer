import { FormControl, FormGroup } from "@angular/forms";
import { BehaviorSubject, Observable } from "rxjs";

interface AsyncTask {
    name: string;
    done: Observable<any>;
}

/**
 * Add some typing to the angular forms
 */
declare module "@angular/forms/src/model" {

    interface FormControl<T = any> {
        readonly valueChanges: Observable<T>;
        readonly value: T;
        setValue(value: T, options?: {
            onlySelf?: boolean;
            emitEvent?: boolean;
            emitModelToViewChange?: boolean;
            emitViewToModelChange?: boolean;
        }): void;
        // get<K extends keyof T>(path: K): AbstractControl<T[K]>;
        // get<S>(path: (string | number)[]): AbstractControl<S>;
        // get(path: (string | number)[]): AbstractControl<any>;
    }
}
