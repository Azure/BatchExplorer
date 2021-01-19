import { ChangeDetectionStrategy, Component } from "@angular/core";
import { FormControl } from "@angular/forms";
import { MatDialogRef } from "@angular/material/dialog";
import { autobind } from "@batch-flask/core";

import "./ssh-key-picker-dialog.scss";

@Component({
    selector: "bl-ssh-key-picker-dialog",
    templateUrl: "ssh-key-picker-dialog.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SSHKeyPickerDialogComponent {
    public sshPublicKey = new FormControl();

    constructor(public dialogRef: MatDialogRef<string>) {

    }

    @autobind()
    public submit() {
        this.dialogRef.close(this.sshPublicKey.value);
    }
}
