import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { autobind } from "core-decorators";
import { Observable } from "rxjs";

import { NotificationManager } from "app/components/base/notifications";
import { SidebarRef } from "app/components/base/sidebar";
import { Application } from "app/models";
import { applicationToFormModel } from "app/models/forms";
import { ApplicationService, HttpUploadService } from "app/services";
import { Constants } from "app/utils";

@Component({
    selector: "bex-job-create-basic-dialog",
    templateUrl: "application-create-dialog.html",
})
export class ApplicationCreateDialogComponent implements OnInit {
    public file: File;
    public applicationForm: FormGroup;
    public blockCount: number = 0;

    // upload block size of 1mb
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
        private notificationManager: NotificationManager) {

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

    public ngOnInit() {
        /** noop */
    }

    public setValue(application: Application) {
        this.applicationForm.patchValue(applicationToFormModel(application));
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

        /**
         * TODO :: The following code wont be run from here. It will be kicked off
         * from the submit() method. Just here so i can test it on file selection.
         *
         * NOTE: mostly taken from here:
         * http://gauravmantri.com/2013/02/16/uploading-large-files-in-windows-azure-blob-storage-using-shared-access-signature-html-and-javascript/
         */
        if (this.hasValidFile()) {
            this._blockIds = [];
            this._currentFilePointer = 0;
            this._totalBytesRemaining = 0;
            this._blockSize = 1024 * 1024;
            this._bytesUploaded = 0;

            this._fileReader = new FileReader();
            this._fileReader.onloadend = (evt => this._fileReaderLoadEnded(evt));

            console.log("fileSelected :: ", this.file.path);

            let fileSize = this.file.size;
            this._blockSize = fileSize < this._blockSize
                ? fileSize
                : this._blockSize;

            console.log("max block size :: " + this._blockSize);

            this._totalBytesRemaining = fileSize;
            if (fileSize % this._blockSize === 0) {
                this.blockCount = fileSize / this._blockSize;
            } else {
                this.blockCount = Math.floor(fileSize / this._blockSize) + 1;
            }

            console.log("total blocks to upload :: " + this.blockCount);
            this._readAndUploadFileBlocks();
        }
    }

    public hasValidFile(): boolean {
        return this.file && this.applicationForm.controls["package"].valid;
    }

    @autobind()
    public submit(): Observable<any> {
        const formData = this.applicationForm.value;
        const observable = this.applicationService.put(formData.id, formData.version);
        observable.subscribe({
            next: (packageVersion) => {
                const id = formData.id;
                /**
                 * get "packageVersion.storageUrl" and use that SAS to upload the package into storage
                 * then call /activate to complete the upload.
                 *
                 * todo:
                 *      create upload file handler action
                 *      create activate package action
                 *      pass both of these actions to the long running task mananger
                 *      on completion call the onApplicationAdded code below
                 */

                console.log("packageVersion.storageUrl :: ", packageVersion.storageUrl);

                this.applicationService.onApplicationAdded.next(id);
                this.notificationManager.success(
                    "Application added!",
                    `Version ${packageVersion.version} for application '${id}' was successfully created!`,
                );
            },
            error: () => {
                /**
                 * Handle put application errors:
                 *  - max applications reached
                 */
            },
        });

        return observable;
    }

    private _readAndUploadFileBlocks() {
        if (this._totalBytesRemaining > 0) {
            // todo: not actually sure that these need to be padded. will check out the
            // storage docs in the morning so see the blocklist format.
            const blockId = "block-" + (this._blockIds.length + "").padStart(6, "0");
            const fileContent = this.file.slice(this._currentFilePointer,
                this._currentFilePointer + this._blockSize);

            console.log(`block id: ${blockId}, current file pointer: ${this._currentFilePointer}, bytes read: ${this._blockSize}`);

            this._blockIds.push(btoa(blockId));
            this._fileReader.readAsArrayBuffer(fileContent);

            this._currentFilePointer += this._blockSize;
            this._totalBytesRemaining -= this._blockSize;

            if (this._totalBytesRemaining < this._blockSize) {
                this._blockSize = this._totalBytesRemaining;
            }
        } else {
            this._commitBlockList();
        }
    }

    private _fileReaderLoadEnded(evt: any) {
        // console.log("_afterLoadEnded :: ", evt);
        if (evt.target.readyState === 2) {
            console.log("evt.target.result.length :: ", evt.target.result.byteLength);
            console.log("evt.target :: ", evt.target);
            // const requestData = new Uint8Array(evt.target.result);

            const requestData = evt.target.result;

            console.log("requestData.length :: ", requestData.byteLength);

            // upload file here to SAS URL then call to upload the next one
            // this.uploadService.uploadBlock(sasUrl, requestData)
            let url = "https://andrew1973.blob.core.windows.net/app-test-a94a8fe5ccb19ba61c4c0873d391e987982fbbd3/test-2.1-90347f95-af9b-4f83-9fac-e9aa2e2d5392?sv=2015-04-05&sr=b&sig=JlinNzzh355LtKL9O73DHXuS7WVg6Golsl8QbW2taao%3D&st=2017-02-09T01%3A31%3A22Z&se=2017-02-09T05%3A36%3A22Z&sp=rw";
            url = url + "&comp=block&blockid=" + this._blockIds[this._blockIds.length - 1];

            this.httpUploadService.putBlock(url, requestData).subscribe({
                next: (response) => {
                    console.log("RESPONSE :: ", response);
                    this._bytesUploaded += requestData.byteLength;
                    const percentComplete = Math.floor(this._bytesUploaded / this.file.size * 100);
                    console.log(`requestData.byteLength: ${requestData.byteLength}, progress: ${percentComplete}%`);
                    this._readAndUploadFileBlocks();
                },
                error: (error) => {
                    console.log("ERROR :: ", error);
                },
            });
        }
    }

    private _commitBlockList() {
        console.log("*** _commitBlockList ***");
        let url = "https://andrew1973.blob.core.windows.net/app-test-a94a8fe5ccb19ba61c4c0873d391e987982fbbd3/test-2.1-90347f95-af9b-4f83-9fac-e9aa2e2d5392?sv=2015-04-05&sr=b&sig=JlinNzzh355LtKL9O73DHXuS7WVg6Golsl8QbW2taao%3D&st=2017-02-09T01%3A31%3A22Z&se=2017-02-09T05%3A36%3A22Z&sp=rw";
        url = url + "&comp=blocklist";

        const commitOptions = {
            blockIds: this._blockIds,
            fileType: this.file.type,
        };

        this.httpUploadService.commitBlockList(url, commitOptions).subscribe({
            next: (response) => {
                /** happy */
            },
            error: (error) => {
                console.log("ERROR :: ", error);
            },
        });
    }
}
