import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { autobind } from "core-decorators";
import { Observable } from "rxjs";

import { NotificationManager } from "app/components/base/notifications";
import { SidebarRef } from "app/components/base/sidebar";
import { Application } from "app/models";
import { applicationToFormModel } from "app/models/forms";
import { ApplicationService } from "app/services";
import { Constants } from "app/utils";

@Component({
    selector: "bex-job-create-basic-dialog",
    templateUrl: "application-create-dialog.html",
})
export class ApplicationCreateDialogComponent implements OnInit {
    public applicationForm: FormGroup;

    constructor(
        private formBuilder: FormBuilder,
        public sidebarRef: SidebarRef<ApplicationCreateDialogComponent>,
        private applicationService: ApplicationService,
        private notificationManager: NotificationManager) {

        const validation = Constants.forms.validation;
        this.applicationForm = this.formBuilder.group({
            id: ["", [
                Validators.required,
                Validators.maxLength(validation.maxLength.applicationName),
                Validators.pattern(validation.regex.id),
            ]],
            version: ["", [
                Validators.required,
                Validators.maxLength(validation.maxLength.version),
                Validators.pattern(validation.regex.appVersion),
            ]],
        });
    }

    public ngOnInit() {
        /** noop */
    }

    public setValue(application: Application) {
        this.applicationForm.patchValue(applicationToFormModel(application));
    }

    @autobind()
    public submit(): Observable<any> {
        const formData = this.applicationForm.value;
        const observable = this.applicationService.put(formData.id, formData.version);
        observable.subscribe({
            next: (packageVersion) => {
                const id = formData.id;

                /**
                 * get "packageVersion.storageUrl" and use that SAS to upload the package into storage
                 * then call /activate to complete the upload.
                 */

                this.applicationService.onApplicationAdded.next(id);
                this.notificationManager.success(
                    "Application added!",
                    `Version ${packageVersion.version} for application '${id}' was successfully created!`
                );
            },
            error: () => null,
        });

        return observable;
    }
}
