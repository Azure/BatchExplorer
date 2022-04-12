import { Directive, EventEmitter, Input, Output } from "@angular/core";
import { FormGroup } from "@angular/forms";
import { MatDialogRef } from "@angular/material/dialog";
import { ServerError, autobind } from "@batch-flask/core";
import { SidebarRef } from "../sidebar";

export type ContainerRef = MatDialogRef<any> | SidebarRef<any> | GenericContainer;
export interface GenericContainer {
    /**
     * Method to destroy the container
     */
    destroy();
}

@Directive()
// eslint-disable-next-line @angular-eslint/directive-class-suffix
export class FormBase {
    @Output() public done = new EventEmitter();

    /**
     * Dialog ref, sidebar ref or any other kind of container that has a destroy method on it.
     * If provided this will add a add and close button option that will close the sidebar when the form is submitted.
     */
    @Input() public containerRef: ContainerRef;

    /**
     * Form group used in this form
     */
    @Input() public formGroup: FormGroup;

    public loading = false;
    public error: ServerError = null;
    public showError = false;

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
        if (container instanceof MatDialogRef) {
            container.close();
        } else if (container instanceof SidebarRef) {
            container.destroy();
        } else {
            container.destroy();
        }
    }
}
