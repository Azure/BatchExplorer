import { Component, Input } from "@angular/core";
import { FormBuilder, FormGroup } from "@angular/forms";

import { autobind } from "core-decorators";

@Component({
    selector: "bex-node-user-credentials-form",
    templateUrl: "node-user-credentials-form.html",
})
export class NodeUserCredentialsFormComponent {
    @Input()
    public isWindowsNode: boolean;

    @Input()
    public submit: (credentials) => any;

    public form: FormGroup;

    constructor(formBuilder: FormBuilder) {
        this.form = formBuilder.group({
            username: [""],
            password: [""],
            isAdmin: [true],
        });
    }

    @autobind()
    public submitForm() {
        const credentials = this.form.value;
        return this.submit(credentials);
    }
}
