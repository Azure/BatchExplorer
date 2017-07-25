import { Injectable } from "@angular/core";
import { ComponentType, MdDialog, MdDialogConfig, MdDialogRef } from "@angular/material";
import { Observable } from "rxjs";
import { ConfirmationDialogComponent } from "./confirmation-dialog.component";

export interface ConfirmOptions {
    description?: string;
    yes: () => Observable<any>;
}

/**
 * Dialog service is a service to help open commonly used dialog such as a confirmation dialog.
 * It can also open a dialog the same way material does so you only need to inject this service and not the MdDialog
 */
@Injectable()
export class DialogService {
    constructor(private mdDialog: MdDialog) { }

    public confirm(title: string = "Are you sure?", options: ConfirmOptions) {
        const ref = this.mdDialog.open(ConfirmationDialogComponent);
        const component = ref.componentInstance;
        component.title = title;
        component.description = options.description;
        component.execute = options.yes;
    }

    public open<T>(type: ComponentType<T>, config?: MdDialogConfig): MdDialogRef<T> {
        return this.mdDialog.open(type, config);
    }
}
