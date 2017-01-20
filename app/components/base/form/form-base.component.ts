import { FormGroup } from "@angular/forms";
import { autobind } from "core-decorators";
import { Observable, Subject } from "rxjs";

import { FormUtils } from "app/utils";

/**
 * Base component forms should inherit which adds a basic structure for it
 */
export abstract class FormBaseComponent<TEntity, TFormModel> {
    public form: FormGroup;

    public beforeSubmit = new Subject();
    public afterSubmit = new Subject();

    @autobind()
    public submit() {
        this.beforeSubmit.next(true);
        const obs = this.execute();
        obs.subscribe({
            next: () => {
                this.afterSubmit.next(true);
            },
            error: () => null,
        });
        return obs;
    }

    public patchValue(value: TEntity) {
        this.form.patchValue(this.entityToForm(value));
    }

    public disable(path: string | string[]) {
        const control = FormUtils.getControl(this.form, path);
        control.disable();
    }

    protected abstract entityToForm(entity: TEntity): TFormModel;
    protected abstract execute(): Observable<any>;
}
