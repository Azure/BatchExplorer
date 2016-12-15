import { Component } from "@angular/core";

import { FormBase } from "../form-base";

@Component({
    selector: "bex-create-form",
    templateUrl: "create-form.html",
})
export class CreateFormComponent extends FormBase {
    public add() {
        return this.performAction();
    }

    public addAndClose() {
        return this.performActionAndClose();
    }
}
