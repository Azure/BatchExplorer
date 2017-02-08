import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { autobind } from "core-decorators";
import { Observable } from "rxjs";

import { NotificationManager } from "app/components/base/notifications";
import { SidebarRef } from "app/components/base/sidebar";
import { Application } from "app/models";
import { applicationToFormModel } from "app/models/forms";
import { ApplicationService } from "app/services";
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
        if (this.file) {
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
            error: () => null,
        });

        return observable;
    }

    private _readAndUploadFileBlocks() {
        if (this._totalBytesRemaining > 0) {
                const blockId = "block-" + (this._blockIds.length + "").padStart(6, "0");
                const fileContent = this.file.slice(this._currentFilePointer,
                    this._currentFilePointer + this._blockSize);

                console.log(`block id: ${blockId}, current file pointer: ${this._currentFilePointer}, bytes read: ${this._blockSize}`);

                /**
                 * TODO: a couple of sites say not to use "btoa" as apparently it has an issue
                 * handling Unicode.
                 */
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
            const requestData = new Uint8Array(evt.target.result);

            // upload file here to SAS URL then call to upload the next one
            // this.uploadService.uploadBlock(sasUrl, requestData)

            this._bytesUploaded += requestData.length;
            const percentComplete = Math.floor(this._bytesUploaded / this.file.size * 100);
            console.log(`requestData.length: ${requestData.length}, progress: ${percentComplete}%`);

            this._readAndUploadFileBlocks();
        }
    }

    private _commitBlockList() {
        console.log("*** _commitBlockList ***");
        // this.uploadService.commitBlockList(sasUrl, this._blockIds)
    }
}
