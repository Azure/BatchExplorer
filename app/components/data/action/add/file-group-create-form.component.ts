import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormControl, Validators } from "@angular/forms";
import { autobind } from "core-decorators";
import { Observable } from "rxjs";

import { NotificationService } from "app/components/base/notifications";
import { SidebarRef } from "app/components/base/sidebar";
import { DynamicForm } from "app/core";
import { BlobContainer, ServerError } from "app/models";
import { FileGroupCreateDto } from "app/models/dtos";
import { CreateFileGroupModel, createFileGroupFormToJsonData, fileGroupToFormModel } from "app/models/forms";
import { AccountService, PythonRpcService, StorageService } from "app/services";
import { AdalService } from "app/services/adal";
import { Constants, log } from "app/utils";
import * as path from "path";

import "./file-group-create-form.scss";

@Component({
    selector: "bl-file-group-create-form",
    templateUrl: "file-group-create-form.html",
})
export class FileGroupCreateFormComponent extends DynamicForm<BlobContainer, FileGroupCreateDto> implements OnInit {
    public folder: string;
    public groupExists: boolean;
    public editing: boolean;
    public title: string = "Create file group";
    public description: string = "Upload files into a managed storage container that you can use " +
        "for resource files in your jobs and tasks";

    constructor(
        public sidebarRef: SidebarRef<FileGroupCreateFormComponent>,
        private adalService: AdalService,
        private accountService: AccountService,
        private formBuilder: FormBuilder,
        private notificationService: NotificationService,
        private pythonRpcService: PythonRpcService,
        private storageService: StorageService) {
        super(FileGroupCreateDto);

        const validation = Constants.forms.validation;
        this.form = this.formBuilder.group({
            name: ["", [
                Validators.required,
                Validators.maxLength(validation.maxLength.fileGroup),
                Validators.pattern(validation.regex.fileGroup),
            ], [
                this._validateFileGroupName.bind(this),
            ]],
            folder: ["", [Validators.required]],
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
        const resource = Constants.ResourceUrl.batch;

        const observable = this.accountService.currentAccount.cascade((account) => {
            return this.adalService.accessTokenFor(account.subscription.tenantId, resource).cascade((token) => {
                return this.pythonRpcService.call("create_file_group", [
                    token,
                    formData.name,
                    formData.includeSubDirectories ? path.join(formData.folder, "**\\*") : formData.folder,
                    formData.options,
                    account.toJS(),
                ]).catch((error) => {
                    return Observable.throw(ServerError.fromPython(error));
                });
            });
        }).share();

        observable.subscribe({
            next: (data) => {
                const message = `${data.uploaded} files were successfully uploaded to the file group`;
                this.storageService.onFileGroupAdded.next(`${this.storageService.ncjFileGroupPrefix}${formData.name}`);
                this.notificationService.success("Create file group", message, { persist: true });
            },
            error: (error) => {
                log.error("Failed to create form group", error);
            },
        });

        return observable;
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

    /**
     * Async validator to check if a given file-group exists.
     * If it does exist then we inform the user that they will be modifying
     * the existing group and not creating a new one.
     */
    private _validateFileGroupName(control: FormControl): Promise<any> {
        return new Promise ((resolve) => {
            setTimeout(() => {
                const containerName = `${this.storageService.ncjFileGroupPrefix}${control.value}`;
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
            }, 500);
        });
    }
}
