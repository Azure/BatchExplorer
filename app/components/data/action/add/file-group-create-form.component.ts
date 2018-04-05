import { Component, OnDestroy } from "@angular/core";
import { FormBuilder, FormControl, Validators } from "@angular/forms";
import { MatCheckboxChange } from "@angular/material";
import { DynamicForm, autobind } from "@batch-flask/core";
import { BackgroundTaskService, NotificationService, SidebarRef } from "@batch-flask/ui";
import { Observable, Subscription } from "rxjs";

import { BlobContainer } from "app/models";
import { FileGroupCreateDto, FileOrDirectoryDto } from "app/models/dtos";
import { CreateFileGroupModel, createFileGroupFormToJsonData, fileGroupToFormModel } from "app/models/forms";
import { FileSystemService, NcjFileGroupService } from "app/services";
import { AutoStorageService, StorageContainerService } from "app/services/storage";
import { Constants, log } from "app/utils";

import "./file-group-create-form.scss";

interface DataTotals {
    uploaded?: number;
    total?: number;
    partial?: number;
    pathCounter: number;
    pathsExpected: number;
    actual: number;
    expected: number;
    failed: number;
}

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
        private backgroundTaskService: BackgroundTaskService,
        private autoStorageService: AutoStorageService,
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

        this._subscription = this.form.controls.name.valueChanges.distinctUntilChanged().debounceTime(400)
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
        const msgFormat = `Syncing ({0}/{1}) paths to: {2}`;
        const trimmedName = this._sanitizeFileGroupName(formData.name);

        return this.backgroundTaskService.startTask("Uploading files to file group", (task) => {
            const observable = Observable.fromPromise(this._getValidPaths(formData.paths)).flatMap((validPaths) => {
                const lastData: DataTotals = this._initDataTotals(1, validPaths.length);
                let message = msgFormat.format(lastData.pathCounter, lastData.pathsExpected, trimmedName);
                task.name.next(message);

                return Observable.from(validPaths).flatMap((fileOrDirPath) => {
                    const createObs = this.fileGroupService.createOrUpdateFileGroup(
                        formData.name,
                        fileOrDirPath,
                        formData.options,
                        formData.includeSubDirectories);

                    createObs.subscribe({
                        next: (data) => {
                            Object.assign(lastData, data);
                            // check partial to see if we are uploading a large file in chunks.
                            if (data.partial) {
                                // tslint:disable-next-line:max-line-length
                                task.name.next(`Syncing large file: ${data.partial}%, completed (${lastData.pathCounter - 1}/${lastData.pathsExpected}) paths`);
                            } else {
                                task.name.next(`${message}, (${data.uploaded}/${data.total}) files.`);
                            }

                            task.progress.next(data.uploaded / data.total * 100);
                        },
                        complete: () => {
                            // path has finished processing.
                            if (lastData.pathCounter < lastData.pathsExpected) {
                                lastData.pathCounter++;
                            }

                            lastData.actual += lastData.uploaded;
                            lastData.expected += lastData.total;
                            message = msgFormat.format(lastData.pathCounter, lastData.pathsExpected, trimmedName);
                            task.name.next(`${message}, (${lastData.uploaded}/${lastData.total}) files`);
                        },
                        error: (error) => {
                            log.error("Failed to create or modify file group", error);
                            lastData.failed++;
                        },
                    });

                    return createObs;
                }).finally(() => {
                    task.progress.next(100);
                    const fileGroupName = this.fileGroupService.addFileGroupPrefix(formData.name);
                    this.storageContainerService.onContainerAdded.next(fileGroupName);
                    this.notificationService.success(
                        "Create file group",
                        `${lastData.actual} files were successfully uploaded to the file group`,
                    );
                });
            }).share();

            return observable;
        });
    }

    private _initDataTotals(pathsHit, paths) {
        return {
            pathCounter: pathsHit,
            pathsExpected: paths,
            actual: 0,
            expected: 0,
            failed: 0,
        };
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

    private _sanitizeFileGroupName(fileGroupName: string) {
        return fileGroupName && fileGroupName.length > 16
            ? `${fileGroupName.substring(0, 15)}...`
            : fileGroupName;
    }
}
