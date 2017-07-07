import { Component } from "@angular/core";
import { FormBuilder, Validators } from "@angular/forms";
import { autobind } from "core-decorators";
import { Observable } from "rxjs";

import { NotificationService } from "app/components/base/notifications";
import { SidebarRef } from "app/components/base/sidebar";
import { DynamicForm } from "app/core";
import { Job } from "app/models";
import { JobCreateDto } from "app/models/dtos";
import { createJobFormToJsonData, jobToFormModel } from "app/models/forms";
import { StorageService } from "app/services";
import { Constants } from "app/utils";

@Component({
    selector: "bl-file-group-create-form",
    templateUrl: "file-group-create-form.html",
})
export class FileGroupCreateFormComponent extends DynamicForm<Job, JobCreateDto> {
    constructor(
        private formBuilder: FormBuilder,
        public sidebarRef: SidebarRef<FileGroupCreateFormComponent>,
        private storageService: StorageService,
        private notificationService: NotificationService) {
        super(JobCreateDto);

        const validation = Constants.forms.validation;
        this.form = this.formBuilder.group({
            id: ["", [
                Validators.required,
                Validators.maxLength(validation.maxLength.id),
                Validators.pattern(validation.regex.id),
            ]],
        });
    }

    public dtoToForm(job: JobCreateDto) {
        return jobToFormModel(job);
    }

    public formToDto(data: any): JobCreateDto {
        return createJobFormToJsonData(data);
    }

    @autobind()
    public submit(): Observable<any> {
        // const job = this.getCurrentValue();
        // const observable = this.jobService.add(job, {});
        // observable.subscribe({
        //     next: () => {
        //         const id = job.id;
        //         this.jobService.onJobAdded.next(id);
        //         this.notificationService.success("Job added!", `Job '${id}' was created successfully!`);
        //     },
        //     error: () => null,
        // });

        // return observable;
        return Observable.of(null);
    }
}
