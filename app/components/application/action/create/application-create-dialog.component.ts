import { Component } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Response } from "@angular/http";
import { autobind } from "core-decorators";
import { AsyncSubject, Observable } from "rxjs";

import { NotificationService } from "app/components/base/notifications";
import { SidebarRef } from "app/components/base/sidebar";
import { Application } from "app/models";
import { applicationToCreateFormModel } from "app/models/forms";
import { ApplicationService, CommitBlockListOptions, HttpUploadService, UploadBlockOptions } from "app/services";
import { Constants, prettyBytes } from "app/utils";

@Component({
    selector: "bex-application-create-dialog",
    templateUrl: "application-create-dialog.html",
})
export class ApplicationCreateDialogComponent {
    public file: File;
    public applicationForm: FormGroup;
    public blockCount: number = 0;
    public progress: string;
    public title: string = "Create application package";
    public description: string = "Upload an application package and give it an identifier to create your application";

    private _blockSize: number;
    private _fileReader: FileReader;
    private _blockIds: string[];
    private _currentFilePointer: number;
    private _totalBytesRemaining: number;
    private _bytesUploaded: number;

    constructor(
        private formBuilder: FormBuilder,
        public sidebarRef: SidebarRef<ApplicationCreateDialogComponent>,
        private applicationService: ApplicationService,
        private httpUploadService: HttpUploadService,
        private notificationService: NotificationService) {

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
            package: ["", [
                Validators.required,
                Validators.pattern(validation.regex.appFilename),
            ]],
        });
    }

    public setValue(application: Application, version?: string) {
        // TODO: need to disable appId and version fields if they are supplied
        this.applicationForm.patchValue(applicationToCreateFormModel(application, version));
        if (version) {
            this.title = "Update selected package";
            this.description = "Select a new package to overwrite the existing version";
        } else {
            this.description = "Upload a new package version for the selected application";
        }
    }

    public fileSelected(changeEvent: Event) {
        const element = <any>changeEvent.srcElement;
        this.applicationForm.controls["package"].markAsTouched();

        if (element.files.length > 0) {
            this.file = element.files[0];
            this.applicationForm.controls["package"].setValue(this.file.name);
        } else {
            this.file = null;
            this.applicationForm.controls["package"].setValue(null);
        }
    }

    public hasValidFile(): boolean {
        return this.file && this.applicationForm.controls["package"].valid;
    }

    public prettyFileSize(size: number) {
        return prettyBytes(size);
    }

    @autobind()
    public submit(): Observable<any> {
        const formData = this.applicationForm.value;

        /**
         * Todo:
         * - create upload file handler action
         * - create activate package action
         * - pass both of these actions to the long running task mananger
         * handle errors
         *  - max applications, or packages reached
         */
        return this.applicationService.put(formData.id, formData.version)
            .cascade((packageVersion) => this._uploadAppPackage(this.file, packageVersion.storageUrl))
            .cascade(() => {
                return this.applicationService.activatePackage(formData.id, formData.version).subscribe({
                    next: () => {
                        this.applicationService.onApplicationAdded.next(formData.id);
                        this.notificationService.success(
                            "Application added!",
                            `Version ${formData.version} for application '${formData.id}' was successfully created!`,
                        );
                    },
                    error: (response: Response) => {
                        /**
                         * Possible errors
                         *  - trying to put a package that already exists and has allowUpdates = false
                         *      409 (The settings for the specified application forbid package updates.)
                         *      code : "ApplicationDoesntAllowPackageUpdates"
                         *      message :
                         *          "The settings for the specified application forbid package updates."
                         *          RequestId: 0427d452-dbfe-48ff-80f9-680a26bbff27
                         *          Time:2017-02-13T03:35:27.0685745Z
                         */
                        console.error("Failed to activate application package :: ", response);
                        this.notificationService.error(
                            "Activation failed",
                            "The application package was uploaded into storage successfully, "
                            + "but the activation process failed.",
                        );
                    },
                });
            });
    }

    private _uploadAppPackage(file, sasUrl): Observable<any> {
        if (!this.hasValidFile()) {
            return Observable.throw("Valid file not selected");
        }

        this._blockIds = [];
        this._currentFilePointer = 0;
        this._totalBytesRemaining = 0;

        // block size of 2mb
        this._blockSize = 1024 * 1024 * 2;
        this._bytesUploaded = 0;

        const subject = new AsyncSubject<any>();
        this._fileReader = new FileReader();
        this._fileReader.onloadend = (evt => this._fileReaderLoadEnded(evt, sasUrl, subject));

        let fileSize = this.file.size;
        this._blockSize = fileSize < this._blockSize
            ? fileSize
            : this._blockSize;

        this._totalBytesRemaining = fileSize;
        if (fileSize % this._blockSize === 0) {
            this.blockCount = fileSize / this._blockSize;
        } else {
            this.blockCount = Math.floor(fileSize / this._blockSize) + 1;
        }

        this._readAndUploadFileBlocks(sasUrl, subject);

        return subject.asObservable();
    }

    private _readAndUploadFileBlocks(sasUrl: string, subject: AsyncSubject<any>) {
        if (this._totalBytesRemaining > 0) {
            const blockId = "block-" + (this._blockIds.length + "").padStart(6, "0");
            const fileContent = this.file.slice(this._currentFilePointer,
                this._currentFilePointer + this._blockSize);

            // console.log(`block id: ${blockId}, current file pointer: ${this._currentFilePointer}`);
            // console.log(`bytes read: ${this._blockSize}`);

            this._blockIds.push(btoa(blockId));

            // this calls off to _fileReaderLoadEnded callback
            this._fileReader.readAsArrayBuffer(fileContent);

            this._currentFilePointer += this._blockSize;
            this._totalBytesRemaining -= this._blockSize;

            if (this._totalBytesRemaining < this._blockSize) {
                this._blockSize = this._totalBytesRemaining;
            }
        } else {
            this._commitBlockList(sasUrl).subscribe({
                next: () => {
                    subject.next(true);
                    subject.complete();
                },
                error: (error) => {
                    subject.error(error);
                },
            });
        }
    }

    private _fileReaderLoadEnded(evt: any, sasUrl: string, subject: AsyncSubject<any>) {
        if (evt.target.readyState === 2) {
            const requestData: ArrayBuffer = evt.target.result;
            const uploadOptions: UploadBlockOptions = {
                blockId: this._blockIds[this._blockIds.length - 1],
                blockContent: requestData,
            };

            this.httpUploadService.putBlock(sasUrl, uploadOptions).subscribe({
                next: (response) => {
                    this._bytesUploaded += requestData.byteLength;
                    const percentComplete = Math.floor(this._bytesUploaded / this.file.size * 100);
                    this.progress = `${percentComplete}%`;
                    this._readAndUploadFileBlocks(sasUrl, subject);
                },
                error: (error) => {
                    console.error("ERROR :: ", error);
                },
            });
        }
    }

    private _commitBlockList(sasUrl: string): Observable<any> {
        const commitOptions: CommitBlockListOptions = {
            blockIds: this._blockIds,
            fileType: this.file.type,
        };

        return this.httpUploadService.commitBlockList(sasUrl, commitOptions);
    }
}
