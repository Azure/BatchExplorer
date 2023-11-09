import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, HostBinding, Input, Output } from "@angular/core";
import { Action } from "@azure/bonito-core/lib/action";
import { FormValues } from "@azure/bonito-core/lib/form";
import { ActionForm, ActionFormProps } from "@azure/bonito-ui/lib/components/form";
import { Observable } from "rxjs";
import { FormSize } from "@batch-flask/ui/form";
import { ContainerRef } from "@batch-flask/ui/form/form-base";
import { MatDialogRef } from "@angular/material/dialog";
import { SidebarRef } from "@batch-flask/ui";

import "./react-action-form.scss";
import { autobind } from "@batch-flask/core";
import { translate } from "@azure/bonito-core";

/**
 * SimpleForm is an helper component that use a ComplexForm with only 1 page and section.
 */
@Component({
    selector: "be-react-action-form",
    templateUrl: "react-action-form.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReactActionFormComponent {
    public ActionForm = ActionForm;

    public actionFormProps: ActionFormProps<FormValues> = {};

    @Output()
    public done = new EventEmitter();

    @Input()
    public title: string;

    @Input()
    public subtitle: string;

    @Input()
    @HostBinding("class")
    public size: FormSize = "large";

    @Input()
    @HostBinding("class.sticky-footer")
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
    public submit: (error?: unknown) => Observable<unknown> | null;

    @Input()
    public submitText = translate("bonito.core.save");

    @Input()
    public cancelText = translate("bonito.core.close");

    @Input()
    public set action(action: Action) {
        this.actionFormProps = {
            action: action,
            submitButtonLabel: this.submitText,
            hideResetButton: true,
            buttons: [
                {
                    label: this.cancelText,
                    onClick: () => {
                        this.close();
                    }
                }
            ],
            onExecuteSucceeded: () => {
                this.submit();
                this.close();
            },
            onError: (error: unknown) => {
                this.submit(error);
            },
            onExecuteFailed: (error: unknown) => {
                this.submit(error);
            }
        };
        this.changeDetector.markForCheck();
    }

    constructor(private changeDetector: ChangeDetectorRef) {}

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
