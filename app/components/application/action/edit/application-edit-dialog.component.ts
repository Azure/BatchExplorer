import { Component } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Response } from "@angular/http";
import { autobind } from "core-decorators";
import { Observable } from "rxjs";

import { NotificationService } from "app/components/base/notifications";
import { SidebarRef } from "app/components/base/sidebar";
import { Application, ApplicationPackage } from "app/models";
import { applicationToEditFormModel, editApplicationFormToJsonData } from "app/models/forms";
import { ApplicationService  } from "app/services";
import { Constants } from "app/utils";

@Component({
    selector: "bex-application-edit-dialog",
    templateUrl: "application-edit-dialog.html",
})
export class ApplicationEditDialogComponent {
    public appplication: Application;
    public packages: ApplicationPackage[];
    public applicationForm: FormGroup;

    constructor(
        private formBuilder: FormBuilder,
        public sidebarRef: SidebarRef<ApplicationEditDialogComponent>,
        private applicationService: ApplicationService,
        private notificationService: NotificationService) {

        const validation = Constants.forms.validation;
        this.applicationForm = this.formBuilder.group({
            id: ["", []],
            allowUpdates: ["", [
                Validators.required,
            ]],
            displayName: ["", [
                Validators.maxLength(validation.maxLength.displayName),
            ]],
            defaultVersion: ["", []],
        });
    }

    public setValue(application: Application) {
        this.appplication = application;
        this.packages = application.packages || [];
        this.applicationForm.patchValue(applicationToEditFormModel(application));
    }

    @autobind()
    public submit(): Observable<any> {
        const jsonData = editApplicationFormToJsonData(this.applicationForm.value);
        const patchObs = this.applicationService.patch(this.appplication.id, jsonData);
        patchObs.subscribe({
            next: (response: any) => {
                this.notificationService.success(
                    "Application updated!",
                    `Application ${this.appplication.id} was successfully updated!`,
                );
            },
            error: (response: Response) => {
                this.notificationService.error("Update failed", "The application failed to update successfully");
            },
        });

        return patchObs;
    }
}
