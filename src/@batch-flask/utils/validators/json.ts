import { FormControl } from "@angular/forms";
import { Observable } from "rxjs/Observable";

// tslint:disable-next-line:no-var-requires
const stripJsonComments = require("strip-json-comments");

/**
 * Validator that requires controls to have a valid json
 */
export function validJsonConfig(c: FormControl): Observable<any> {
    return Observable.of(null).debounceTime(400).map(() => {
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
    });
}
