import { Injectable } from "@angular/core";
import { MdDialog } from "@angular/material";
import { Observable } from "rxjs";
import { ConfirmationDialogComponent } from "./confirmation-dialog.component";

export interface ConfirmOptions {
    description?: string;
    yes: () => Observable<any>;
}

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
}
