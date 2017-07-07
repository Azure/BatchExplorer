import { Component } from "@angular/core";
import { FormBuilder, Validators } from "@angular/forms";
import { autobind } from "core-decorators";
import { Observable } from "rxjs";

import { NotificationService } from "app/components/base/notifications";
import { SidebarRef } from "app/components/base/sidebar";
import { DynamicForm } from "app/core";
import { BlobContainer } from "app/models";
import { FileGroupCreateDto } from "app/models/dtos";
import { CreateFormGroupModel, createFormGroupFormToJsonData } from "app/models/forms";
import { StorageService } from "app/services";
import { Constants } from "app/utils";

@Component({
    selector: "bl-file-group-create-form",
    templateUrl: "file-group-create-form.html",
})
export class FileGroupCreateFormComponent extends DynamicForm<BlobContainer, FileGroupCreateDto> {
    public folder: string;

    constructor(
        private formBuilder: FormBuilder,
        public sidebarRef: SidebarRef<FileGroupCreateFormComponent>,
        private storageService: StorageService,
        private notificationService: NotificationService) {
        super(FileGroupCreateDto);

        const validation = Constants.forms.validation;
        this.form = this.formBuilder.group({
            name: ["", [
                Validators.required,
                Validators.maxLength(validation.maxLength.id),
                Validators.pattern(validation.regex.id),
            ]],
            folder: ["", [Validators.required]],
            accessPolicy: ["private"],
        });
    }

    @autobind()
    public submit(): Observable<any> {
        this.notificationService.warn("Create file group", "Not wired up to persist anything yet ...");
        const formGroup = this.getCurrentValue();

        console.log("form group json: ", formGroup.toJS());

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

    public dtoToForm(fileGroup: FileGroupCreateDto): CreateFormGroupModel {
        // dont think we need to clone to nothing to do here
        return null;
    }

    public formToDto(data: CreateFormGroupModel): FileGroupCreateDto {
        return createFormGroupFormToJsonData(data);
    }

    public selectFolder(changeEvent: Event) {
        const element = changeEvent.srcElement as any;
        this.form.controls["folder"].markAsTouched();

        if (element.files.length > 0) {
            this.folder = element.files[0].path;
            this.form.controls["folder"].setValue(this.folder);
        } else {
            this.folder = null;
            this.form.controls["folder"].setValue(null);
        }
    }

    public hasValidFolder(): boolean {
        return this.folder && this.form.controls["folder"].valid;
    }
}
