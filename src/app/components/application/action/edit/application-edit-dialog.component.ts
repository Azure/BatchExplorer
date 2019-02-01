import { HttpErrorResponse } from "@angular/common/http";
import { ChangeDetectorRef, Component } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { autobind } from "@batch-flask/core";
import { NotificationService } from "@batch-flask/ui/notifications";
import { SidebarRef } from "@batch-flask/ui/sidebar";
import { BatchApplication, BatchApplicationPackage } from "app/models";
import { applicationToEditFormModel, editApplicationFormToJsonData } from "app/models/forms";
import { BatchApplicationPackageService, BatchApplicationService } from "app/services";
import { Constants } from "common";
import { List } from "immutable";
import { Observable } from "rxjs";

@Component({
    selector: "bl-application-edit-dialog",
    templateUrl: "application-edit-dialog.html",
})
export class ApplicationEditDialogComponent {
    public form: FormGroup;
    public application: BatchApplication;
    public packages: List<BatchApplicationPackage>;
    public title: string = "Edit application";
    public description: string = "Update the display name, default version, or locked status of your application";

    constructor(
        private changeDetector: ChangeDetectorRef,
        private formBuilder: FormBuilder,
        public sidebarRef: SidebarRef<ApplicationEditDialogComponent>,
        private applicationService: BatchApplicationService,
        private packageService: BatchApplicationPackageService,
        private notificationService: NotificationService) {

        const validation = Constants.forms.validation;
        this.form = this.formBuilder.group({
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

    public setValue(application: BatchApplication) {
        this.application = application;
        this.packages = List([]);
        this.changeDetector.markForCheck();

        this.packageService.listAll(application.id).subscribe((packages) => {
            this.packages = packages;
            this.changeDetector.markForCheck();
        });
        this.form.patchValue(applicationToEditFormModel(application));
    }

    public trackByFn(_: number, pkg: BatchApplicationPackage) {
        return pkg.id;
    }

    @autobind()
    public submit(): Observable<any> {
        const jsonData = editApplicationFormToJsonData(this.form.value);
        const patchObs = this.applicationService.patch(this.application.id, jsonData);
        patchObs.subscribe({
            next: (response: any) => {
                this.notificationService.success(
                    "Application updated!",
                    `Application ${this.application.id} was successfully updated!`,
                );
            },
            error: (response: HttpErrorResponse) => {
                this.notificationService.error("Update failed", "The application failed to update successfully");
            },
        });

        return patchObs;
    }
}
