import { Component, OnDestroy } from "@angular/core";
import { FormBuilder, FormControl, Validators } from "@angular/forms";
import { MatCheckboxChange } from "@angular/material";
import { DynamicForm, autobind } from "@batch-flask/core";
import {
    Activity,
    ActivityResponse,
    ActivityService,
    ActivityStatus,
    FileSystemService,
    NotificationService,
    SidebarRef,
} from "@batch-flask/ui";
import { BlobContainer } from "app/models";
import { FileGroupCreateDto, FileOrDirectoryDto } from "app/models/dtos";
import { CreateFileGroupModel, createFileGroupFormToJsonData, fileGroupToFormModel } from "app/models/forms";
import { NcjFileGroupService } from "app/services";
import { StorageContainerService } from "app/services/storage";
import { Constants, log } from "app/utils";
import { BehaviorSubject, Observable, Subscription, from } from "rxjs";
import { debounceTime, distinctUntilChanged, map } from "rxjs/operators";

import "./file-group-create-form.scss";

@Component({
    selector: "bl-file-group-create-form",
    templateUrl: "file-group-create-form.html",
})
export class FileGroupCreateFormComponent extends DynamicForm<BlobContainer, FileGroupCreateDto> implements OnDestroy {
    public groupExists: boolean;
    public title: string = "Create file group";
    public description: string = "Upload files into a managed storage container that is used to supply " +
        "resource files for your jobs and tasks. File groups require a 'fgrp-' prefix which is added " +
        "automatically on creation.";
    public createEmptyGroup: boolean = false;
    public showCreateEmptyChk: boolean = true;
    public modifyExisting: boolean = false;

    private _subscription: Subscription;
    private _pathsControl: FormControl;

    constructor(
        public sidebarRef: SidebarRef<FileGroupCreateFormComponent>,
        private formBuilder: FormBuilder,
        private fileGroupService: NcjFileGroupService,
        private fs: FileSystemService,
        private notificationService: NotificationService,
        private activityService: ActivityService,
        private storageContainerService: StorageContainerService) {
        super(FileGroupCreateDto);

        this._pathsControl = formBuilder.control([], Validators.required);
        this.form = this.formBuilder.group({
            name: ["", [
                Validators.required,
                Validators.maxLength(Constants.forms.validation.maxLength.fileGroup),
                Validators.pattern(Constants.forms.validation.regex.fileGroup),
            ]],
            paths: this._pathsControl,
            includeSubDirectories: [true],
            options: [null, []],
            accessPolicy: ["private"],
        });

        this._subscription = this.form.controls.name.valueChanges.pipe(distinctUntilChanged(), debounceTime(400))
            .subscribe((groupName) => {
                if (!groupName) { return; }
                this.fileGroupService.get(groupName).subscribe({
                    next: (container: BlobContainer) => this.groupExists = true,
                    error: () => this.groupExists = false,
                });
            });
    }

    public ngOnDestroy() {
        this._subscription.unsubscribe();
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
    public selectFolder(folder: string) {
        this._pathsControl.markAsTouched();
        const paths = this._pathsControl.value.concat([{
            path: folder,
        }]);

        this._pathsControl.setValue(paths);
    }

    public createEmptyCheckChanged(event: MatCheckboxChange) {
        this.createEmptyGroup = event.checked;
        this._updatePathValidators();
    }

    public dtoToForm(fileGroup: FileGroupCreateDto): CreateFileGroupModel {
        this.showCreateEmptyChk = false;
        if (fileGroup.name) {
            const container = this.fileGroupService.get(fileGroup.name);
            container.subscribe({
                next: (container: BlobContainer) => {
                    this.title = "Add more files to file group";
                    this.description = "Add more files to an already existing file group. " +
                        "Any files that exist already will be updated 'only' if they have changed.";
                    this.modifyExisting = true;
                },
                error: () => {
                    this.form.controls.name.enable();
                    this.modifyExisting = false;
                },
            });
        }

        return fileGroupToFormModel(fileGroup);
    }

    public formToDto(data: CreateFileGroupModel): FileGroupCreateDto {
        return createFileGroupFormToJsonData(data);
    }

    private _updatePathValidators() {
        const validators = !this.createEmptyGroup ? Validators.required : null;
        this._pathsControl.setValidators(validators);
        this._pathsControl.updateValueAndValidity();
    }

    private _createEmptyFileGroup(name: string) {
        const obs = this.fileGroupService.create(name);
        obs.subscribe({
            next: () => {
                this.storageContainerService.onContainerAdded.next(this.fileGroupService.addFileGroupPrefix(name));
            },
            error: () => null,
        });

        return obs;
    }

    private _uploadFileGroupData(formData: FileGroupCreateDto) {
        let totalUploads = 0;

        const initializer = () => {
            return from(this._getValidPaths(formData.paths)).pipe(
                map(validPaths => {
                    // convert each path into a file upload activity
                    return validPaths.map(fileOrDirPath => {
                        return new Activity(`Syncing ${fileOrDirPath}`, () => {
                            let filesUploaded = 0;
                            // subject will only emit when the entire file is uploaded
                            const response: BehaviorSubject<ActivityResponse> =
                                new BehaviorSubject(new ActivityResponse());

                            // upload the file group
                            this.fileGroupService.createOrUpdateFileGroup(
                                formData.name,
                                fileOrDirPath,
                                formData.options,
                                formData.includeSubDirectories).subscribe({
                                    next: (data) => {
                                        filesUploaded = data.uploaded;
                                        let progress;
                                        if (data.partial) {
                                            // the dividend is the files uploaded
                                            // plus the fractional portion of the partially uploaded file
                                            const dividend = data.uploaded + (data.partial / 100);
                                            progress = dividend / data.total * 100;
                                        } else {
                                            progress = data.uploaded / data.total * 100;
                                        }
                                        if (progress === 100) {
                                            totalUploads += filesUploaded;
                                        }
                                        response.next(new ActivityResponse(progress));
                                    },
                                    complete: () => {
                                        response.complete();
                                    },
                                });

                            return response.asObservable();
                        });
                    });
                }),
            );
        };

        const activity = new Activity("Uploading files to file group", initializer);
        this.activityService.exec(activity);
        activity.done.subscribe(status => {
            if (status === ActivityStatus.Completed) {
                const fileGroupName = this.fileGroupService.addFileGroupPrefix(formData.name);
                this.storageContainerService.onContainerAdded.next(fileGroupName);
                this.notificationService.success(
                    "Create file group",
                    `${totalUploads} files were successfully uploaded to the file group`,
                );
            }
        });
        return activity.done;
    }

    /**
     * Return only vaid paths to the caller as the user can enter any path they like.
     * @param fileOrDirectoryPaths - path objects from the the file-or-directory-picker
     */
    private async _getValidPaths(fileOrDirectoryPaths: FileOrDirectoryDto[]): Promise<string[]> {
        const result = [];
        for (const fileOrDir of fileOrDirectoryPaths) {
            const exists = await this.fs.exists(fileOrDir.path);
            if (exists) {
                result.push(fileOrDir.path);
            } else {
                log.warn("Bad path found, ignoring:", fileOrDir.path);
            }
        }

        return result;
    }
}
