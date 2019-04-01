import { ChangeDetectionStrategy, Component, OnDestroy } from "@angular/core";
import { FormControl } from "@angular/forms";
import { MatDialogRef } from "@angular/material";
import { Command, KeyBinding, KeyBindingsService } from "@batch-flask/core";
import { Subject, combineLatest } from "rxjs";
import { takeUntil } from "rxjs/operators";

import "./keybinding-picker-dialog.scss";

@Component({
    selector: "bl-keybinding-picker-dialog",
    templateUrl: "keybinding-picker-dialog.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class KeyBindingPickerDialogComponent implements OnDestroy {
    public binding: KeyBinding;
    public set command(command: Command) {
        this._command = command;
    }
    public get command() { return this._command; }

    public keybinding = new FormControl("");
    public commandAlreadyUsed = false;
    public otherCommands: Command[];

    private _command: Command;
    private _destroy = new Subject();

    constructor(keyBindingService: KeyBindingsService, private dialogRef: MatDialogRef<KeyBinding | null>) {
        this.dialogRef.disableClose = true;
        this.dialogRef.backdropClick().pipe(takeUntil(this._destroy)).subscribe(() => {
            this.dialogRef.close(null);
        });

        combineLatest(
            keyBindingService.keyBindings,
            this.keybinding.valueChanges,
        ).pipe(
            takeUntil(this._destroy),
        ).subscribe(([bindings, value]) => {
            const binding = KeyBinding.parse(value);
            // Get other commands with the same bindings(Exluding the one we are editing)
            const commands = (bindings.get(binding.hash) || []).filter(x => x.id !== this.command.id);
            if (commands.length > 0) {
                this.commandAlreadyUsed = true;
                this.otherCommands = commands;
            } else {
                this.otherCommands = [];
                this.commandAlreadyUsed = false;
            }

        });
    }

    public ngOnDestroy() {
        this._destroy.next();
        this._destroy.complete();
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

    public trackCommand(_: number, command: Command) {
        return command.id;
    }
}
