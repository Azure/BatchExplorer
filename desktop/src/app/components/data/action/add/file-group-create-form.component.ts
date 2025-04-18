import { Component, OnDestroy, Optional } from "@angular/core";
import { FormBuilder, FormControl, Validators } from "@angular/forms";
import { MatCheckboxChange } from "@angular/material/checkbox";
import { MatDialogRef } from "@angular/material/dialog";
import { DynamicForm, autobind } from "@batch-flask/core";
import {
    SidebarRef,
} from "@batch-flask/ui";
import { BlobContainer } from "app/models";
import { FileGroupCreateDto } from "app/models/dtos";
import { CreateFileGroupModel, createFileGroupFormToJsonData, fileGroupToFormModel } from "app/models/forms";
import { FileGroupService } from "app/services";
import { StorageContainerService } from "app/services/storage";
import { Constants } from "common";
import { Observable, Subject } from "rxjs";
import { debounceTime, distinctUntilChanged, takeUntil } from "rxjs/operators";

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

    private _destroy = new Subject();
    private _pathsControl: FormControl;

    constructor(
        @Optional() public sidebarRef: SidebarRef<FileGroupCreateFormComponent>,
        @Optional() public dialogRef: MatDialogRef<FileGroupCreateFormComponent>,
        private formBuilder: FormBuilder,
        private fileGroupService: FileGroupService,
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

        this.form.controls.name.valueChanges.pipe(
            takeUntil(this._destroy),
            distinctUntilChanged(),
            debounceTime(400),
        ).subscribe((groupName) => {
            if (!groupName) { return; }
            this.fileGroupService.get(groupName).subscribe({
                next: (container: BlobContainer) => this.groupExists = true,
                error: () => this.groupExists = false,
            });
        });
    }

    public ngOnDestroy() {
        this._destroy.next();
        this._destroy.complete();
    }

    @autobind()
    public submit(): Observable<any> {
        const formData = this.getCurrentValue();
        if (this.createEmptyGroup) {
            return this._createEmptyFileGroup(formData.name);
        }
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
}
