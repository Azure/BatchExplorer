import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormControl, Validators } from "@angular/forms";
import { Observable } from "rxjs";

import { DynamicForm, autobind } from "@bl-common/core";
import { NotificationService } from "@bl-common/ui/notifications";
import { SidebarRef } from "@bl-common/ui/sidebar";
import { BlobContainer } from "app/models";
import { FileGroupCreateDto } from "app/models/dtos";
import { CreateFileGroupModel, createFileGroupFormToJsonData, fileGroupToFormModel } from "app/models/forms";
import { NcjFileGroupService, StorageService } from "app/services";
import { Constants, log } from "app/utils";

import { BackgroundTaskService } from "@bl-common/ui/background-task";
import "./file-group-create-form.scss";

@Component({
    selector: "bl-file-group-create-form",
    templateUrl: "file-group-create-form.html",
})
export class FileGroupCreateFormComponent extends DynamicForm<BlobContainer, FileGroupCreateDto> implements OnInit {
    public folder: string;
    public folderControl: FormControl;
    public groupExists: boolean;
    public editing: boolean;
    public title: string = "Create file group";
    public description: string = "Upload files into a managed storage container that you can use " +
        "for resource files in your jobs and tasks";

    constructor(
        public sidebarRef: SidebarRef<FileGroupCreateFormComponent>,
        private formBuilder: FormBuilder,
        private fileGroupService: NcjFileGroupService,
        private notificationService: NotificationService,
        private backgroundTaskService: BackgroundTaskService,
        private storageService: StorageService) {
        super(FileGroupCreateDto);

        const validation = Constants.forms.validation;

        this.folderControl = formBuilder.control("", Validators.required);
        this.form = this.formBuilder.group({
            name: ["", [
                Validators.required,
                Validators.maxLength(validation.maxLength.fileGroup),
                Validators.pattern(validation.regex.fileGroup),
            ], [
                    this._validateFileGroupName.bind(this),
                ]],
            folder: this.folderControl,
            includeSubDirectories: [true],
            options: [null, []],
            accessPolicy: ["private"],
        });
    }

    public ngOnInit() {
        this.editing = false;
    }

    @autobind()
    public submit(): Observable<any> {
        const formData = this.getCurrentValue();
        const name = `Uploading file group: ${this._formGroupName(formData.name)}`;
        this.backgroundTaskService.startTask(name, (task) => {
            const observable = this.fileGroupService.createFileGroup(formData);
            let lastData;
            observable.subscribe({
                next: (data) => {
                    lastData = data;
                    task.name.next(`${name} (${data.uploaded}/${data.total})`);
                    task.progress.next(data.uploaded / data.total * 100);
                },
                complete: () => {
                    task.progress.next(100);
                    const message = `${lastData.uploaded} files were successfully uploaded to the file group`;
                    this.storageService.onContainerAdded.next(this.storageService.fileGroupContainer(formData.name));
                    this.notificationService.success("Create file group", message, { persist: true });
                },
                error: (error) => {
                    log.error("Failed to create form group", error);
                },
            });

            return observable;
        });

        return Observable.of(true);
    }

    public dtoToForm(fileGroup: FileGroupCreateDto): CreateFileGroupModel {
        this.editing = true;
        this.title = "Add folder to file group";
        this.description = "Add another folder to an already existing file group";
        this.form.controls.name.disable();

        return fileGroupToFormModel(fileGroup);
    }

    public formToDto(data: CreateFileGroupModel): FileGroupCreateDto {
        return createFileGroupFormToJsonData(data);
    }

    @autobind()
    public selectFolder(folder: string) {
        this.folderControl.markAsTouched();
        this.folder = folder;
        this.folderControl.setValue(folder);
    }

    public hasValidFolder(): boolean {
        return this.folder && this.folderControl.valid;
    }

    private _formGroupName(fileGroupName: string) {
        return fileGroupName && fileGroupName.length > 10
            ? `${fileGroupName.substring(0, 9)}...`
            : fileGroupName;
    }

    /**
     * Async validator to check if a given file-group exists.
     * If it does exist then we inform the user that they will be modifying
     * the existing group and not creating a new one.
     */
    private _validateFileGroupName(control: FormControl): Promise<any> {
        return new Promise((resolve) => {
            setTimeout(() => {
                const containerName = `${Constants.ncjFileGroupPrefix}${control.value}`;
                this.storageService.getContainerOnce(containerName).subscribe({
                    next: (container: BlobContainer) => {
                        this.groupExists = true;
                        resolve(null);
                    },
                    error: (error) => {
                        this.groupExists = false;
                        resolve(null);
                    },
                });
                // timeout for allowing the user to type more than one character.
                // async validation fires after every kepress.
            }, 500);
        });
    }
}
