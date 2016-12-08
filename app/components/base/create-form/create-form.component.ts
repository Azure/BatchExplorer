import { Component, Input } from "@angular/core";
import { animate, state, style, transition, trigger } from "@angular/core";
import { FormGroup } from "@angular/forms";
import { autobind } from "core-decorators";
import { Observable } from "rxjs";

import { BatchError } from "app/models";
import { SidebarRef } from "../sidebar";

interface ErrorData {
    message: string;
    requestId: string;
    time: string;
}

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

    public showErrorTroubleshoot = false;

    public set error(error: BatchError) {
        this._error = error;
        this.errorData = this.parseErrorData();
    }
    public get error() { return this._error; };

    public errorData: ErrorData;

    private _error: BatchError = null;
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

    public parseErrorData(): ErrorData {
        if (!this.error || !this.error.message) {
            return null;
        }
        const value = this.error.message.value;
        // Remove the request id from the the message
        const lines = value.split("\n");
        const message = lines.length > 0 ? lines[0] : null;
        const requestId = lines.length > 1 ? this._parseRequestDetails(lines[1]) : null;
        const time = lines.length > 2 ? this._parseRequestDetails(lines[2]) : null;

        return {
            message,
            requestId,
            time,
        };
    }

    private _parseRequestDetails(value: string): string {
        const data = value.split(":", 2);
        if (data.length > 1) {
            return data[1];
        } else {
            return data[0];
        }
    }
}
