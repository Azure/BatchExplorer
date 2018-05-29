import { DebugElement } from "@angular/core";
import { By } from "@angular/platform-browser";

export function query(root: DebugElement): CustomQuery {
    return new CustomQuery(root);
}

export class CustomQuery {

    constructor(public root: DebugElement) { }

    /**
     * To be used with reactive forms.
     * Get the input with the given path.
     *
     * e.g.
     *
     * ByFormInput("os.cloudServiceConfiguration.osFamily")
     *
     * will look for a formControlName 'osFamily' inside a formControlGroup 'cloudServiceConfiguration'
     * being inside a 'os' group itself
     */
    public byFormControl(path: string): DebugElement {
        let de = this.root;
        const segments = path.split(".");
        const controlName = segments.pop();
        for (const groupName of segments) {
            de = de.query(By.css(`[fromGroupName=${groupName}]`));
            expect(de).not.toBeNull(`Cannot find form group '${groupName}' in path '${path}'`);
            if (de === null) {
                return null;
            }
        }

        const controlDe = de.query(By.css(`[fromControlName=${controlName}]`));
        expect(controlDe).not.toBeNull(`Cannot find the control '${controlName}' in the path '${path}'`);
        return controlDe;
    }
}
