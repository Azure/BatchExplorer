import { Component, Input } from "@angular/core";
import { FormGroup } from "@angular/forms";
import { autobind } from "core-decorators";
import { Observable } from "rxjs";

import { BatchError } from "app/models";
import { SidebarRef } from "../sidebar";

@Component({
    selector: "bex-create-form",
    templateUrl: "create-form.html",
})
export class CreateFormComponent {
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
    public sidebarRef: SidebarRef<any>;

    @Input()
    public submit: () => Observable<any>;

    public loading = false;

    public error: BatchError = null;

    @autobind()
    public add(): Observable<any> {
        this.loading = true;
        const obs = this.submit();
        obs.subscribe({
            next: () => {
                this.loading = false;
                this.error = null;
            },
            error: (e: BatchError) => {
                console.log("CAUGHT ERROR :: ", e);
                this.loading = false;
                this.error = e;
            },
        });

        return obs;
    }

    @autobind()
    public addAndClose(): Observable<any> {
        const obs = this.add();
        obs.subscribe(() => {
            setTimeout(() => {
                this.close();
            }, 1000);
        });

        return obs;
    }

    public close() {
        if (this.sidebarRef) {
            this.sidebarRef.destroy();
        }
    }

    public get errorMessage() {
        if (!this.error || !this.error.message) {
            return null;
        }

        const message = this.error.message.value;
        // Remove the request id from the the message
        const val = message.split("\n");

        return val.length > 0 ? val[0] : null;
    }
}
