import { Component, Input } from "@angular/core";

import { FormBase } from "../form-base";

@Component({
    selector: "bl-create-form",
    templateUrl: "create-form.html",
})
export class CreateFormComponent extends FormBase {
    @Input()
    public multiUse = true;

    @Input()
    public actionName = "Add";

    public add() {
        return this.performAction();
    }

    public addAndClose() {
        return this.performActionAndClose();
    }

    public get addAndCloseText() {
        return this.multiUse ? `${this.actionName} and close` : this.actionName;
    }
}
