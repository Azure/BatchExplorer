import { Input } from "@angular/core";
import { FormGroup } from "@angular/forms";
import { MdDialogRef } from "@angular/material";
import { autobind } from "core-decorators";
import { Observable } from "rxjs";

import { BatchError } from "app/models";
import { SidebarRef } from "../sidebar";

export class FormBase {
    /**
     * Dialog ref if the form is used in the dialog.
     * If provided this will add a add and close button option that will close the sidebar when the form is submitted.
     */
    @Input()
    public dialogRef: MdDialogRef<any>;

    /**
     * Sidebar ref if the form is used in the sidebar.
     * If provided this will add a add and close button option that will close the sidebar when the form is submitted.
     */
    @Input()
    public sidebarRef: SidebarRef<any>;

    @Input()
    public submit: () => Observable<any>;

    /**
     * Form group used in this form
     */
    @Input()
    public formGroup: FormGroup;

    public loading = false;
    public error: BatchError = null;

    constructor() {
    }

    @autobind()
    public performAction(): Observable<any> {
        this.loading = true;
        const obs = this.submit();
        obs.subscribe({
            next: () => {
                this.loading = false;
                this.error = null;
            },
            error: (e: BatchError) => {
                this.loading = false;
                this.error = e;
            },
        });
        return obs;
    }

    @autobind()
    public performActionAndClose(): Observable<any> {
        const obs = this.performAction();
        obs.subscribe({
            complete: () => {
                setTimeout(() => {
                    this.close();
                }, 1000);
            },
            error: () => null,
        });
        return obs;
    }

    public cancel() {
        this.close();
    }

    public close() {
        if (this.dialogRef) {
            // this.zone.run(() => {
            this.dialogRef.close();
            // });
        } else if (this.sidebarRef) {
            this.sidebarRef.destroy();
        }
    }
}
