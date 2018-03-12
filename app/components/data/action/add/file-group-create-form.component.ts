import { Component } from "@angular/core";
import { FormBuilder, FormControl, Validators } from "@angular/forms";
import { MatCheckboxChange } from "@angular/material";
import { Observable } from "rxjs";

import { DynamicForm, autobind } from "@batch-flask/core";
import { NotificationService } from "@batch-flask/ui/notifications";
import { SidebarRef } from "@batch-flask/ui/sidebar";
import { BlobContainer } from "app/models";
import { FileGroupCreateDto } from "app/models/dtos";
import { CreateFileGroupModel, createFileGroupFormToJsonData, fileGroupToFormModel } from "app/models/forms";
import { FileSystemService, NcjFileGroupService, StorageService } from "app/services";
import { Constants, log } from "app/utils";

import { BackgroundTaskService } from "@batch-flask/ui/background-task";
import "./file-group-create-form.scss";

@Component({
    selector: "bl-file-group-create-form",
    templateUrl: "file-group-create-form.html",
})
export class FileGroupCreateFormComponent extends DynamicForm<BlobContainer, FileGroupCreateDto> {
    public folder: string;
    public groupExists: boolean;
    public title: string = "Create file group";
    public description: string = "Upload files into a managed storage container that you can use " +
        "for resource files in your jobs and tasks";
    public createEmptyGroup: boolean = false;

    private _folderControl: FormControl;

    constructor(
        public sidebarRef: SidebarRef<FileGroupCreateFormComponent>,
        private formBuilder: FormBuilder,
        private fileGroupService: NcjFileGroupService,
        private fs: FileSystemService,
        private notificationService: NotificationService,
        private backgroundTaskService: BackgroundTaskService,
        private storageService: StorageService) {
        super(FileGroupCreateDto);

        const validation = Constants.forms.validation;

        this._folderControl = formBuilder.control([], Validators.required);
        this.form = this.formBuilder.group({
            name: ["", [
                Validators.required,
                Validators.maxLength(validation.maxLength.fileGroup),
                Validators.pattern(validation.regex.fileGroup),
            ], [
                    this._validateFileGroupName.bind(this),
            ]],
            folder: this._folderControl,
            includeSubDirectories: [true],
            options: [null, []],
            accessPolicy: ["private"],
        });

        this._folderControl.valueChanges.subscribe((value) => {
            console.log("folderControl chaged :: ", this._folderControl.value);
        });
    }

    @autobind()
    public submit(): Observable<any> {
        const formData = this.getCurrentValue();
        if (this.createEmptyGroup) {
            return this._createEmptyFileGroup(formData.name);
        }

        return this._uploadFileGroupData(formData);
    }

    @autobind()
    public async selectFolder(folder: string) {
        this._folderControl.markAsTouched();
        const stats = await this.fs.lstat(folder);
        const files = this._folderControl.value.concat([{
            path: folder,
            isFile: stats.isFile(),
        }]);

        this._folderControl.setValue(files);
    }

    public emptyCheck(event: MatCheckboxChange) {
        this.createEmptyGroup = event.checked;
        // remove validator from path list control if not required
        const validators = !this.createEmptyGroup ? Validators.required : null;
        this._folderControl.setValidators(validators);
        this._folderControl.updateValueAndValidity();
    }

    public dtoToForm(fileGroup: FileGroupCreateDto): CreateFileGroupModel {
        this.title = "Add folder to file group";
        this.description = "Add another folder to an already existing file group";
        this.form.controls.name.disable();

        return fileGroupToFormModel(fileGroup);
    }

    public formToDto(data: CreateFileGroupModel): FileGroupCreateDto {
        return createFileGroupFormToJsonData(data);
    }

    public hasValidFolder(): boolean {
        return this.folder && this._folderControl.valid;
    }

    private _createEmptyFileGroup(name: string) {
        const container = `${Constants.ncjFileGroupPrefix}${name}`;
        const obs = this.storageService.createContainer(container);
        obs.subscribe({
            next: () => {
                this.storageService.onContainerAdded.next(container);
            },
            error: () => null,
        });

        return obs;
    }

    private _uploadFileGroupData(formData: FileGroupCreateDto) {
        // TODO: check valid path, ignore and log if not valid
        const name = `Uploading file group: ${this._sanitizeFileGroupName(formData.name)}`;
        this.backgroundTaskService.startTask(name, (task) => {
            const observable = this.fileGroupService.createFileGroup(formData);
            let lastData;
            observable.subscribe({
                next: (data) => {
                    lastData = data;
                    if (data.partial) {
                        // tslint:disable-next-line:max-line-length
                        task.name.next(`Processing large file: ${data.partial}%, completed (${data.uploaded}/${data.total})`);
                    } else {
                        task.name.next(`${name} (${data.uploaded}/${data.total})`);
                    }

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

    private _sanitizeFileGroupName(fileGroupName: string) {
        return fileGroupName && fileGroupName.length > 20
            ? `${fileGroupName.substring(0, 19)}...`
            : fileGroupName;
    }

    /**
     * Async validator to check if a given file-group exists.
     * If it does exist then we inform the user that they will be modifying
     * the existing group and not creating a new one.
     */
    private _validateFileGroupName(control: FormControl) {
        const containerName = `${Constants.ncjFileGroupPrefix}${control.value}`;
        return Observable.of(null).debounceTime(500)
            .flatMap(() => this.storageService.getContainerOnce(containerName))
            .map((container: BlobContainer) => {
                this.groupExists = true;
            }).catch(() => {
                this.groupExists = false;
                return Observable.of(null);
            });
    }
}
