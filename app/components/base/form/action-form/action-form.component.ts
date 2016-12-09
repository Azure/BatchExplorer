import { Component, Input } from "@angular/core";
import { animate, state, style, transition, trigger } from "@angular/core";
import { FormGroup } from "@angular/forms";
import { MdDialogRef } from "@angular/material";
import { autobind } from "core-decorators";
import { Observable } from "rxjs";

import { BatchError } from "app/models";
import { SidebarRef } from "../../sidebar";

@Component({
    selector: "bex-action-form",
    templateUrl: "action-form.html",
})
export class ActionFormComponent {
    /**
     * Form group used in this form
     */
    @Input()
    public formGroup: FormGroup;

    /**
     * Sidebar ref if the form is used in the sidebar.
     * If provided this will add a add and close button option that will close the sidebar when the form is submitted.
     */
    @Input()
    public dialogRef: MdDialogRef<any>;

    @Input()
    public submit: () => Observable<any>;

    @Input()
    public submitText = "Proceed";

    @Input()
    public cancelText = "Cancel";

    public loading = false;

    public showErrorTroubleshoot = false;

    public error: BatchError = null;

    /**
     * Enabled if the formGroup is valid or there is no formGroup
     */
    public get submitEnabled() {
        return !this.formGroup || this.formGroup.valid;
    }

    @autobind()
    public action(): Observable<any> {
        this.loading = true;
        const obs = this.submit();
        obs.subscribe({
            next: () => {
                this.loading = false;
                this.error = null;
                setTimeout(() => {
                    this.cancel();
                }, 1000);
            },
            error: (e: BatchError) => {
                this.loading = false;
                this.error = e;
            },
        });
        return obs;
    }

    public cancel() {
        if (this.dialogRef) {
            this.dialogRef.close();
        }
    }
}
