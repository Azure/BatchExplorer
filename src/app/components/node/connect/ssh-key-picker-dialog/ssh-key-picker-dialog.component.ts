import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from "@angular/core";
import { FormControl } from "@angular/forms";
import { MatDialogRef } from "@angular/material";
import { autobind } from "@batch-flask/core";

import "./ssh-key-picker-dialog.scss";

@Component({
    selector: "bl-ssh-key-picker-dialog",
    templateUrl: "ssh-key-picker-dialog.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SSHKeyPickerDialogComponent {
    public sshPublicKey = new FormControl();

    constructor(private changeDetector: ChangeDetectorRef, private dialogRef: MatDialogRef<string>) {

    }

    @autobind()
    public submit() {
        this.dialogRef.close(this.sshPublicKey.value);
    }
}
