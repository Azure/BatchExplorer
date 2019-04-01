import { ChangeDetectionStrategy,  Component } from "@angular/core";
import { FormControl } from "@angular/forms";
import { MatDialogRef } from "@angular/material";
import { Command, KeyBinding } from "@batch-flask/core";

import "./keybinding-picker-dialog.scss";

@Component({
    selector: "bl-keybinding-picker-dialog",
    templateUrl: "keybinding-picker-dialog.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class KeyBindingPickerDialogComponent {
    public binding: KeyBinding;
    public set command(command: Command) {
        this._command = command;
    }
    public get command() { return this._command; }

    public keybinding = new FormControl("");
    private _command: Command;

    constructor(private dialogRef: MatDialogRef<KeyBinding | null>) {
        this.dialogRef.disableClose = true;
        this.dialogRef.backdropClick().subscribe(() => {
            this.dialogRef.close(null);
        });
    }

    public updateKeyBinding(binding: KeyBinding | null) {
        if (binding) {
            if (binding.hash === "enter" && this.binding && this.binding.hash !== "") {
                this.dialogRef.close(this.binding);
            }
            this.binding = binding;
            this.keybinding.setValue(binding.hash);
        } else {
            this.dialogRef.close(null);
        }
    }
}
