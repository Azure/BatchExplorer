import { Component, Input } from "@angular/core";
import { FormBuilder, FormGroup } from "@angular/forms";

import { autobind } from "core-decorators";

export enum CredentialsMode {
    Password,
    SSHPublicKey,
}
@Component({
    selector: "bl-node-user-credentials-form",
    templateUrl: "node-user-credentials-form.html",
})
export class NodeUserCredentialsFormComponent {
    public CredentialsMode = CredentialsMode;

    @Input()
    public isWindowsNode: boolean;

    @Input()
    public submit: (credentials) => any;

    public form: FormGroup;

    constructor(formBuilder: FormBuilder) {
        this.form = formBuilder.group({
            username: [""],
            mode: [CredentialsMode.Password],
            password: [""],
            sshKey: [""],
            isAdmin: [true],
        });
    }

    @autobind()
    public submitForm() {
        const credentials = this.form.value;
        return this.submit(credentials);
    }

    public get useSSHKey(){
        return this.form.value.mode === CredentialsMode.SSHPublicKey;
    }
}
