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
    public file: File;
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
            package: ["", [
                Validators.required,
                Validators.pattern(validation.regex.appFilename),
            ]],
        });
    }

    public ngOnInit() {
        /** noop */
    }

    public setValue(application: Application) {
        this.applicationForm.patchValue(applicationToFormModel(application));
    }

    public fileSelected(changeEvent: Event) {
        const element = <any>changeEvent.srcElement;
        if (element.files.length > 0) {
            this.file = element.files[0];
            // this.applicationForm.patchValue({ package: this.file.name });
            this.applicationForm.controls["package"].setValue(this.file.name);
        } else {
            this.file = null;
            this.applicationForm.controls["package"].setValue(null);
            // this.applicationForm.patchValue({ package: null });
        }

        // this.applicationForm.controls["package"].touched = true;
        console.log("this.applicationForm.controls[\"package\"] :: ", this.applicationForm.controls["package"]);
        console.log("fileSelected :: ", this.file);
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
