import { ComponentType } from "@angular/cdk/portal";
import { Injectable } from "@angular/core";
import { AsyncValidatorFn, ValidatorFn } from "@angular/forms";
import { MatDialog, MatDialogConfig, MatDialogRef } from "@angular/material";
import { Observable } from "rxjs";
import { ConfirmationDialogComponent } from "./confirmation-dialog.component";
import { PromptDialogComponent } from "./prompt";

export interface ConfirmOptions {
    description?: string;
    yes: () => Observable<any> | void;
}

export interface ValidatorMessage {
    code: string;
    message: string;
}

export interface PromptOptions {
    description?: string;
    prompt: (value: string) => Observable<any>;
    validator?: ValidatorFn | ValidatorFn[] | null;
    asyncValidator?: AsyncValidatorFn | AsyncValidatorFn[];
    validatorMessages?: ValidatorMessage[];
}

/**
 * Dialog service is a service to help open commonly used dialog such as a confirmation dialog.
 * It can also open a dialog the same way material does so you only need to inject this service and not the MatDialog
 */
@Injectable()
export class DialogService {
    constructor(private matDialog: MatDialog) { }

    public confirm(title: string = "Are you sure?", options: ConfirmOptions) {
        const ref = this.matDialog.open(ConfirmationDialogComponent);
        const component = ref.componentInstance;
        component.title = title;
        component.description = options.description;
        component.execute = options.yes;
    }

    public prompt(title: string = "Are you sure?", options: PromptOptions) {
        const ref = this.matDialog.open(PromptDialogComponent);
        const component = ref.componentInstance;
        component.title = title;
        component.description = options.description;
        component.execute = options.prompt;
        component.validator = options.validator;
        component.asyncValidator = options.asyncValidator;
        component.validatorMessages = options.validatorMessages;
    }

    public open<T>(type: ComponentType<T>, config?: MatDialogConfig): MatDialogRef<T> {
        return this.matDialog.open(type, config);
    }
}
