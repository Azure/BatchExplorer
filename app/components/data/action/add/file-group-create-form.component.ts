import { Component } from "@angular/core";
import { FormBuilder, Validators } from "@angular/forms";
import { autobind } from "core-decorators";
import { Observable } from "rxjs";

import { NotificationService } from "app/components/base/notifications";
import { SidebarRef } from "app/components/base/sidebar";
import { DynamicForm } from "app/core";
import { BlobContainer } from "app/models";
import { FileGroupCreateDto } from "app/models/dtos";
import { CreateFileGroupModel, createFileGroupFormToJsonData } from "app/models/forms";
import { Constants } from "app/utils";

import "./file-group-create-form.scss";

@Component({
    selector: "bl-file-group-create-form",
    templateUrl: "file-group-create-form.html",
})
export class FileGroupCreateFormComponent extends DynamicForm<BlobContainer, FileGroupCreateDto> {
    public folder: string;

    constructor(
        private formBuilder: FormBuilder,
        public sidebarRef: SidebarRef<FileGroupCreateFormComponent>,
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
            options: [null, []],
            accessPolicy: ["private"],
        });
    }

    @autobind()
    public submit(): Observable<any> {
        this.notificationService.warn("Create file group", "Not wired up to persist anything yet ...");
        const formGroup = this.getCurrentValue();

        // todo: remove when done
        console.warn("form group json: ", formGroup.toJS());

        return Observable.of(null);
    }

    public dtoToForm(fileGroup: FileGroupCreateDto): CreateFileGroupModel {
        // dont think we need to clone so nothing to do here
        return null;
    }

    public formToDto(data: CreateFileGroupModel): FileGroupCreateDto {
        return createFileGroupFormToJsonData(data);
    }

    @autobind()
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
