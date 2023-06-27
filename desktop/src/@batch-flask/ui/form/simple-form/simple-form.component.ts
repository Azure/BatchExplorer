import { Component, EventEmitter, Input, Output } from "@angular/core";
import { FormGroup } from "@angular/forms";
import { Observable } from "rxjs";
import { FormSize } from "../complex-form";
import { ContainerRef } from "../form-base";

import "./simple-form.scss";

/**
 * SimpleForm is an helper component that use a ComplexForm with only 1 page and section.
 */
@Component({
    selector: "bl-simple-form",
    templateUrl: "simple-form.html",
})
export class SimpleFormComponent {
    @Output()
    public done = new EventEmitter();

    @Input()
    public title: string;

    @Input()
    public subtitle: string;

    @Input()
    public multiUse = true;

    @Input()
    public formGroup: FormGroup = new FormGroup({});

    @Input()
    public actionName = "Save";

    @Input()
    public size: FormSize = "large";

    @Input()
    public stickyFooter: boolean = true;

    /**
     * Dialog ref, sidebar ref or generic container if the form is used in a dialog, sidebar or any other container.
     * If provided this will add a add and close button option that will close the sidebar when the form is submitted.
     */
    @Input()
    public containerRef: ContainerRef;

    /**
     * Submit method.
     * Needs to return an observable that will have a {ServerError} if failing.
     */
    @Input()
    public submit: () => Observable<any> | null;

    @Input()
    public cancelText = "Cancel";

    @Input()
    public actionColor = "primary";
}
