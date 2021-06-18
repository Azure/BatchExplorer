import { Component } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { autobind } from "@batch-flask/core";
import { NotificationService } from "@batch-flask/ui/notifications";
import { SidebarRef } from "@batch-flask/ui/sidebar";
import { log, prettyBytes } from "@batch-flask/utils";
import { BatchApplication, BatchApplicationPackage } from "app/models";
import { applicationToCreateFormModel } from "app/models/forms";
import { BatchApplicationPackageService, BatchApplicationService } from "app/services";
import { StorageBlobService } from "app/services/storage";
import * as storage from "azure-storage";
import { Constants } from "common";
import { Observable, of, throwError } from "rxjs";
import { catchError, share, switchMap, tap } from "rxjs/operators";

@Component({
    selector: "bl-application-create-dialog",
    templateUrl: "application-create-dialog.html",
})
export class ApplicationCreateDialogComponent {
    public file: File;
    public form: FormGroup;
    public blockCount: number = 0;
    public progress: string;
    public title: string = "Create application package";
    public description: string = "Upload an application package and give it an identifier to create your application";

    constructor(
        private formBuilder: FormBuilder,
        public sidebarRef: SidebarRef<ApplicationCreateDialogComponent>,
        private applicationService: BatchApplicationService,
        private packageService: BatchApplicationPackageService,
        private storageBlobService: StorageBlobService,
        private notificationService: NotificationService) {

        const validation = Constants.forms.validation;
        this.form = this.formBuilder.group({
            name: ["", [
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

    public setValue(application: BatchApplication, version?: string) {
        this.form.controls.name.disable();
        this.form.patchValue(applicationToCreateFormModel(application, version));
        if (version) {
            this.title = "Update selected package";
            this.description = "Select a new package to overwrite the existing version";
        } else {
            this.description = "Upload a new package version for the selected application";
        }
    }

    public fileSelected(changeEvent: Event) {
        const element = changeEvent.srcElement as any;
        this.form.controls["package"].markAsTouched();

        if (element.files.length > 0) {
            this.file = element.files[0];
            this.form.controls["package"].setValue(this.file.name);
        } else {
            this.file = null;
            this.form.controls["package"].setValue(null);
        }
    }

    public hasValidFile(): boolean {
        return this.file && this.form.controls["package"].valid;
    }

    public prettyFileSize(size: number) {
        return prettyBytes(size);
    }

    @autobind()
    public submit(): Observable<any> {
        const formData = this.form.value;
        const applicationName = this.form.controls.name.value;

        return this.packageService.put(applicationName, formData.version).pipe(
            switchMap((pkg: BatchApplicationPackage) => {
                return this._uploadAppPackage(this.file, pkg.properties.storageUrl).pipe(
                    tap(() => {
                        this.applicationService.onApplicationAdded.next(pkg.applicationId);
                        this.packageService.onPackageAdded.next(pkg.id);
                    }),
                    switchMap(() => this._tryActivate(applicationName, pkg)),
                );
            }),
            share(),
        );
    }

    private _uploadAppPackage(file: File, sasUrl: string): Observable<storage.BlobService.BlobResult> {
        if (!this.hasValidFile()) {
            return throwError("Valid file not selected");
        }
        return this.storageBlobService.uploadToSasUrl(sasUrl, file.path);
    }

    private _tryActivate(applicationName: string, pkg: BatchApplicationPackage): Observable<any> {
        return this.packageService.activate(pkg.id).pipe(
            tap(() => {
                this.notificationService.success(
                    "Application added!",
                    `Version ${pkg.name} for application '${applicationName}' was successfully created!`,
                );
            }),
            catchError((err) => {
                /**
                 * Possible errors
                 *  - trying to put a package that already exists and has allowUpdates = false
                 *      409 (The settings for the specified application forbid package updates.)
                 *      code : "ApplicationDoesntAllowPackageUpdates"
                 *      message :
                 *          "The settings for the specified application forbid package updates."
                 *          RequestId: 0427d452-dbfe-48ff-80f9-680a26bbff27
                 *          Time:2017-02-13T03:35:27.0685745Z
                 */
                log.error("Failed to activate application package :: ", err);
                this.notificationService.error(
                    "Activation failed",
                    "The application package was uploaded into storage successfully, "
                    + "but the activation process failed.",
                );
                return of(null);
            }),
        );
    }
}
