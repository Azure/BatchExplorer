import { Component, Input } from "@angular/core";
import { FormGroup } from "@angular/forms";
import { MdDialogRef } from "@angular/material";
import { Observable } from "rxjs";

import { SidebarRef } from "app/components/base/sidebar";
import { FormSize } from "../complex-form";


/**
 * SimpleForm is an helper component that use a ComplexForm with only 1 page and section.
 */
@Component({
    selector: "bl-simple-form",
    templateUrl: "simple-form.html",
})
export class SimpleFormComponent {
    @Input()
    public title: string;

    @Input()
    public subtitle: string;

    @Input()
    public multiUse = true;

    @Input()
    public formGroup: FormGroup;

    @Input()
    public actionName = "Save";


    @Input()
    public size: FormSize = "large";

    @Input()
    public stickyFooter: boolean = true;

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

    @Input()
    public cancelText = "Cancel";

    @Input()
    public actionColor = "primary";
}
