import { Component, EventEmitter, Input, Output } from "@angular/core";
import { FormBuilder, FormGroup } from "@angular/forms";
import { autobind } from "@batch-flask/core";
import * as moment from "moment";

import { AddNodeUserAttributes } from "app/services";

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
    public set isLinuxNode(value: boolean) {
        this._isLinuxNode = value;
        if (value) {
            this.form.patchValue({
                mode: CredentialsMode.SSHPublicKey,
            });
        }
    }
    public get isLinuxNode() { return this._isLinuxNode; }

    @Input() public submit: (credentials) => any;
    @Output() public close = new EventEmitter();

    public form: FormGroup;

    private _isLinuxNode: boolean;

    constructor(formBuilder: FormBuilder) {
        this.form = formBuilder.group({
            username: [""],
            mode: [CredentialsMode.Password],
            password: [""],
            sshPublicKey: [""],
            isAdmin: [true],
            expireIn: [moment.duration({ days: 1 })],
        });
    }

    @autobind()
    public submitForm() {
        const value = this.form.value;
        const credentials: AddNodeUserAttributes = {
            name: value.username,
            isAdmin: value.isAdmin,
            expiryTime: moment().add(value.expireIn).toDate(),
        };
        if (value.mode === CredentialsMode.SSHPublicKey) {
            credentials.sshPublicKey = value.sshPublicKey;
        } else {
            credentials.password = value.password;
        }
        return this.submit(credentials);
    }

    public get useSSHKey() {
        return this.form.value.mode === CredentialsMode.SSHPublicKey;
    }
}
