import { AbstractControl, FormGroup } from "@angular/forms";
export class FormUtils {
    public static getControl(formGroup: FormGroup, path: string | string[]): AbstractControl {
        const actualPath = Array.isArray(path) ? path : [path];
        let current: AbstractControl = formGroup;
        for (const segment of actualPath) {
            current = current.get(segment);
            if (!current) {
                throw new Error(`Path ${actualPath} is invalid, there is no control with name '${segment}'`);
            }
        }
        return current;
    }
}
