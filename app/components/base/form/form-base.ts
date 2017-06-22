import { EventEmitter, Input, Output } from "@angular/core";
import { FormGroup } from "@angular/forms";
import { MdDialogRef } from "@angular/material";
import { autobind } from "core-decorators";
import { Observable } from "rxjs";

import { ServerError } from "app/models";
import { SidebarRef } from "../sidebar";

export type ContainerRef = MdDialogRef<any> | SidebarRef<any> | GenericContainer;
export interface GenericContainer {
    /**
     * Method to destroy the container
     */
    destroy();
}
export class FormBase {
    @Output()
    public done = new EventEmitter();

    /**
     * Dialog ref, sidebar ref or any other kind of container that has a destroy method on it.
     * If provided this will add a add and close button option that will close the sidebar when the form is submitted.
     */
    @Input()
    public containerRef: ContainerRef;

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

    @autobind()
    public cancel() {
        this.close();
    }

    @autobind()
    public close() {
        this.done.emit();
        const container = this.containerRef;
        if (!container) {
            return;
        }
        if (container instanceof MdDialogRef) {
            container.close();
        } else if (container instanceof SidebarRef) {
            container.destroy();
        } else {
            container.destroy();
        }
    }

    public toggleShowError() {
        this.showError = !this.showError;
    }
}
