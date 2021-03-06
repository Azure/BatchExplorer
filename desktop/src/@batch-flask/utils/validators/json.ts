import { FormControl } from "@angular/forms";
import { Observable, of } from "rxjs";
import { debounceTime, map } from "rxjs/operators";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const stripJsonComments = require("strip-json-comments");

/**
 * Validator that requires controls to have a valid json
 */
export function validJsonConfig(c: FormControl): Observable<any> {
    return of(null).pipe(
        debounceTime(400),
        map(() => {
            try {
                JSON.parse(stripJsonComments(c.value, { whitespace: true }));
                return null;
            } catch (e) {
                return {
                    validJson: {
                        valid: false,
                        message: e.message,
                    },
                };
            }
        }),
    );
}
