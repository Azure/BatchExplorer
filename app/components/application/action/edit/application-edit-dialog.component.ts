import { Component } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Response } from "@angular/http";
import { autobind } from "core-decorators";
import { AsyncSubject, Observable } from "rxjs";

import { NotificationService } from "app/components/base/notifications";
import { SidebarRef } from "app/components/base/sidebar";
import { Application } from "app/models";
import { applicationToFormModel } from "app/models/forms";
import { ApplicationService  } from "app/services";
import { Constants } from "app/utils";

@Component({
    selector: "bex-application-edit-dialog",
    templateUrl: "application-edit-dialog.html",
})
export class ApplicationEditDialogComponent {
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
        this.applicationForm.patchValue(applicationToFormModel(application));
    }

    @autobind()
    public submit(): Observable<any> {
        const formData = this.applicationForm.value;
        return Observable.of(true);
        // return this.applicationService.put(formData.id, formData.version)
        //     .cascade((packageVersion) => this._uploadAppPackage(this.file, packageVersion.storageUrl))
        //     .cascade(() => {
        //         return this.applicationService.activatePackage(formData.id, formData.version).subscribe({
        //             next: () => {
        //                 this.applicationService.onApplicationAdded.next(formData.id);
        //                 this.notificationService.success(
        //                     "Application added!",
        //                     `Version ${formData.version} for application '${formData.id}' was successfully created!`,
        //                 );
        //             },
        //             error: (response: Response) => {
        //                 /**
        //                  * Possible errors
        //                  *  - trying to put a package that already exists and has allowUpdates = false
        //                  *      409 (The settings for the specified application forbid package updates.)
        //                  *      code : "ApplicationDoesntAllowPackageUpdates"
        //                  *      message :
        //                  *          "The settings for the specified application forbid package updates."
        //                  *          RequestId: 0427d452-dbfe-48ff-80f9-680a26bbff27
        //                  *          Time:2017-02-13T03:35:27.0685745Z
        //                  */
        //                 console.error("Failed to activate application package :: ", response.json());
        //                 this.notificationService.error(
        //                     "Activation failed",
        //                     "The application package was uploaded into storage successfully, "
        //                     + "but the activation process failed.",
        //                 );
        //             },
        //         });
        //     });
    }
}
