import { Component, Input } from "@angular/core";

import { FormBase } from "../form-base";

@Component({
    selector: "bex-action-form",
    templateUrl: "action-form.html",
})
export class ActionFormComponent extends FormBase {

    @Input()
    public submitText = "Proceed";

    @Input()
    public cancelText = "Cancel";

    /**
     * Enabled if the formGroup is valid or there is no formGroup
     */
    public get submitEnabled() {
        return !this.formGroup || this.formGroup.valid;
    }
}
