import { AbstractControl, FormControl, FormGroup } from "@angular/forms";
import { Observable, of } from "rxjs";
import { filter, map, take } from "rxjs/operators";
import { SanitizedError } from "../error";

export class FormUtils {
    public static getControl(formGroup: FormGroup, path: string | string[]): AbstractControl {
        const actualPath = Array.isArray(path) ? path : [path];
        let current: AbstractControl | null = formGroup;
        for (const segment of actualPath) {
            current = current.get(segment);
            if (!current) {
                throw new SanitizedError(`Path ${actualPath} is invalid, there is no control with name '${segment}'`);
            }
        }
        return current;
    }

    public static passValidation(control: FormControl, processErrors?: (errors: any) => any): Observable<any> {
        const errorProcessor = processErrors || ((errors) => errors);

        if (control.status === "PENDING") {
            return control.statusChanges.pipe(
                filter(x => x !== "PENDING"),
                take(1),
                map(() => {
                    return errorProcessor(control.errors);
                }),
            );
        } else {
            return of(errorProcessor(control.errors));
        }
    }
}
