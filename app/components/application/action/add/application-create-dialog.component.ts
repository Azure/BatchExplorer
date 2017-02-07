import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { autobind } from "core-decorators";
import { Observable } from "rxjs";

import { NotificationManager } from "app/components/base/notifications";
import { SidebarRef } from "app/components/base/sidebar";
import { RangeValidatorDirective } from "app/components/base/validation";
import { Application, Pool } from "app/models";
import { createApplicationFormToJsonData, applicationToFormModel } from "app/models/forms";
import { ApplicationService } from "app/services";
import { RxListProxy } from "app/services/core";
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
        // this.poolsData.fetchNext().subscribe((result) => {
        //     if (result.data && result.data.length > 0) {
        //         this.createJobForm.value.poolId = result.data[0].id;
        //     }
        // });
    }

    public setValue(application: Application) {
        this.applicationForm.patchValue(applicationToFormModel(application));
    }

    @autobind()
    public submit(): Observable<any> {
        // const jsonData = createJobFormToJsonData(this.createJobForm.value);
        // const observable = this.jobService.add(jsonData, {});
        // observable.subscribe({
        //     next: () => {
        //         const id = this.createJobForm.value.id;
        //         this.jobService.onJobAdded.next(id);
        //         this.notificationManager.success("Job added!", `Job '${id}' was created successfully!`);
        //     },
        //     error: () => null,
        // });

        // return observable;
        return null;
    }
}
