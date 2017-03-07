import { Component, ElementRef, OnDestroy, ViewChild } from "@angular/core";
import { FormControl } from "@angular/forms";
import { List } from "immutable";
import { Subscription } from "rxjs";

import { SSHPublicKey } from "app/models";
import { SSHKeyService } from "app/services";

@Component({
    selector: "bl-ssh-key-picker",
    templateUrl: "ssh-key-picker.html",
})
export class SSHKeyPickerComponent implements OnDestroy {
    public savedSSHKeys: List<SSHPublicKey> = List([]);
    public sshKeyValue = new FormControl("");
    public sshKeyName = new FormControl("");
    public showSaveForm = false;

    @ViewChild("nameInput")
    public nameInput: ElementRef;

    private _sub: Subscription;

    constructor(private sshKeyService: SSHKeyService) {
        this._sub = sshKeyService.keys.subscribe((keys) => {
            this.savedSSHKeys = keys;
        });
    }

    public ngOnDestroy() {
        this._sub.unsubscribe();
    }

    public addKey() {
        this.showSaveForm = true;
        setTimeout(() => {
            this.nameInput.nativeElement.focus();
        });
    }

    public cancelAddKey() {
        this.showSaveForm = false;
        this.sshKeyName.patchValue("");
    }

    public saveKey() {
        const value = this.sshKeyValue.value;
        const name = this.sshKeyName.value;

        this.sshKeyService.saveKey(new SSHPublicKey({
            name,
            value,
        }));
        this.showSaveForm = false;
    }

    public selectKey(key: SSHPublicKey) {
        this.sshKeyValue.patchValue(key.value);
    }

    public deleteKey(key: SSHPublicKey) {
        this.sshKeyService.deleteKey(key);
    }
}
