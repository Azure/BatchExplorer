import { EventEmitter, Input, Output } from "@angular/core";
import { FormGroup } from "@angular/forms";
import { MdDialogRef } from "@angular/material";
import { autobind } from "core-decorators";
import { Observable } from "rxjs";

import { ServerError } from "app/models";
import { SidebarRef } from "../sidebar";

export class FormBase {
    @Output()
    public done = new EventEmitter();

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

    /**
     * Submit method.
     * Needs to return an observable that will have a {ServerError} if failing.
     */
    @Input()
    public submit: () => Observable<any>;

    /**
     * Form group used in this form
     */
    @Input()
    public formGroup: FormGroup;

    public loading = false;
    public error: ServerError = null;
    public showError = false;

    @autobind()
    public save(): Observable<any> {
        this.loading = true;
        const obs = this.submit();
        obs.subscribe({
            next: () => {
                this.loading = false;
                this.error = null;
                this.showError = false;
            },
            error: (e: ServerError) => {
                this.loading = false;
                this.error = e;
                this.showError = true;
            },
        });
        return obs;
    }

    @autobind()
    public saveAndClose(): Observable<any> {
        const obs = this.save();
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
        this.done.emit();
        if (this.dialogRef) {
            this.dialogRef.close();
        } else if (this.sidebarRef) {
            this.sidebarRef.destroy();
        }
    }

    public toggleShowError() {
        this.showError = !this.showError;
    }
}
