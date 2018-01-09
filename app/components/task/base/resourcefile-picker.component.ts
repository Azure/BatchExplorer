import { ChangeDetectorRef, Component, HostListener, OnDestroy, forwardRef } from "@angular/core";
import {
    ControlValueAccessor, FormBuilder, FormControl, NG_VALIDATORS, NG_VALUE_ACCESSOR,
} from "@angular/forms";
import * as path from "path";
import { Subscription } from "rxjs";

import { ResourceFile } from "app/models";
import { DragUtils, UrlUtils } from "app/utils";
import { BlobUtilities } from "azure-storage";
import * as moment from "moment";

import { StorageService } from "app/services";
import { SharedAccessPolicy } from "app/services/storage/models";
import "./resourcefile-picker.scss";

// tslint:disable:no-forward-ref
@Component({
    selector: "bl-resourcefile-picker",
    templateUrl: "resourcefile-picker.html",
    providers: [
        { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => ResourcefilePickerComponent), multi: true },
        { provide: NG_VALIDATORS, useExisting: forwardRef(() => ResourcefilePickerComponent), multi: true },
    ],
})
export class ResourcefilePickerComponent implements ControlValueAccessor, OnDestroy {
    public files: FormControl;
    public isDraging = 0;
    public uploadingFiles = [];

    private _propagateChange: (value: ResourceFile[]) => void = null;
    private _sub: Subscription;
    // TODO-TIM read from settings
    private _containerId = "batchlabs-input";

    constructor(
        private formBuilder: FormBuilder,
        private storageService: StorageService,
        private changeDetector: ChangeDetectorRef) {
        this.files = this.formBuilder.control([]);
        this._sub = this.files.valueChanges.subscribe((files) => {
            if (this._propagateChange) {
                this._propagateChange(files);
            }
        });
    }

    public ngOnDestroy() {
        this._sub.unsubscribe();
    }

    public writeValue(value: ResourceFile[]) {
        if (value) {
            this.files.setValue(value);
        }
    }

    public registerOnChange(fn) {
        this._propagateChange = fn;
    }

    public registerOnTouched() {
        // Do nothing
    }

    public validate(c: FormControl) {
        return null;
    }

    @HostListener("dragover", ["$event"])
    public handleDragHover(event: DragEvent) {
        const allowDrop = this._canDrop(event.dataTransfer);
        DragUtils.allowDrop(event, allowDrop);
    }

    @HostListener("dragenter", ["$event"])
    public dragEnter(event: DragEvent) {
        if (!this._canDrop(event.dataTransfer)) { return; }
        event.stopPropagation();
        this.isDraging++;
    }

    @HostListener("dragleave", ["$event"])
    public dragLeave(event: DragEvent) {
        if (!this._canDrop(event.dataTransfer)) { return; }
        this.isDraging--;
    }

    @HostListener("drop", ["$event"])
    public handleDropOnRow(event: DragEvent) {
        event.preventDefault();
        event.stopPropagation();
        const dataTransfer = event.dataTransfer;
        const files = [...event.dataTransfer.files as any];
        if (this._hasLink(dataTransfer)) {
            const link = dataTransfer.getData("text/uri-list");
            if (UrlUtils.isHttpUrl(link)) {
                this._addResourceFileFromUrl(link);
            }
        } else if (this._hasFile(dataTransfer)) {
            console.log("Droped files", files);
            this._uploadFiles(files);
        }
        this.isDraging = 0;
    }

    private _addResourceFileFromUrl(url: string) {
        this._addResourceFile(url, path.basename(url));
    }

    private _uploadFiles(files) {
        for (const file of files) {
            this._uploadFile(file);
        }
    }

    private _uploadFile(file: File) {
        const filename = path.basename(file.path);
        this.uploadingFiles.push(filename);
        this.storageService.uploadFile(this._containerId, file.path, filename).subscribe((result) => {
            this.uploadingFiles = this.uploadingFiles.filter(x => x !== filename);
            this.changeDetector.detectChanges();
            const sas: SharedAccessPolicy = {
                AccessPolicy: {
                    Permissions: BlobUtilities.SharedAccessPermissions.READ,
                    Start: new Date(),
                    Expiry: moment().add(1, "week").toDate(),
                },
            };
            this.storageService.generateSharedAccessBlobUrl(this._containerId, filename, sas).subscribe((url) => {
                this._addResourceFile(url, filename);
            });
        });
    }

    private _addResourceFile(blobSource: string, filePath: string) {
        const files = this.files.value.concat([{
            blobSource,
            filePath,
        }]);
        this.files.setValue(files);
    }

    private _canDrop(dataTransfer: DataTransfer) {
        return this._hasFile(dataTransfer) || this._hasLink(dataTransfer);
    }

    private _hasFile(dataTransfer: DataTransfer) {
        return dataTransfer.types.includes("Files");
    }

    private _hasLink(dataTransfer: DataTransfer) {
        return dataTransfer.types.includes("text/uri-list");
    }
}
