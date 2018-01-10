import { ChangeDetectorRef, Component, EventEmitter, HostListener, OnDestroy, Output, forwardRef } from "@angular/core";
import {
    ControlValueAccessor, FormBuilder, FormControl, NG_VALIDATORS, NG_VALUE_ACCESSOR,
} from "@angular/forms";
import * as path from "path";
import { AsyncSubject, Observable, Subscription } from "rxjs";

import { ResourceFileAttributes } from "app/models";
import { CloudPathUtils, DragUtils, UrlUtils } from "app/utils";
import { BlobUtilities } from "azure-storage";
import * as moment from "moment";

import { FileSystemService, StorageService } from "app/services";
import { SharedAccessPolicy } from "app/services/storage/models";
import "./resourcefile-picker.scss";

export interface UploadResourceFileEvent {
    filename: string;
    done: Observable<any>;
}

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
    @Output() public upload = new EventEmitter();
    public files: FormControl<ResourceFileAttributes[]>;
    public isDraging = 0;
    public uploadingFiles = [];

    private _propagateChange: (value: ResourceFileAttributes[]) => void = null;
    private _sub: Subscription;
    // TODO-TIM read from settings
    private _containerId = "batchlabs-input";

    constructor(
        private formBuilder: FormBuilder,
        private storageService: StorageService,
        private fs: FileSystemService,
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

    public writeValue(value: ResourceFileAttributes[]) {
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
            this._uploadFiles(files.map(x => x.path));
        }
        this.isDraging = 0;
    }

    private _addResourceFileFromUrl(url: string) {
        this._addResourceFile(url, path.basename(url));
    }

    private async _uploadFiles(files: string[], root = "") {
        for (const file of files) {
            await this._uploadPath(file, root);
        }
    }

    private async _uploadPath(filePath: string, root = "") {
        const stats = await this.fs.lstat(filePath);
        if (stats.isFile()) {
            this._uploadFile(filePath, root);
        } else {
            const files = await this.fs.readdir(filePath);
            const paths = files.map(x => path.join(filePath, x));
            await this._uploadFiles(paths, CloudPathUtils.join(root, path.basename(filePath)));
        }
    }

    private _uploadFile(filePath: string, root = "") {
        const filename = path.basename(filePath);
        const nodeFilePath = CloudPathUtils.join(root, filename);
        const blobName = CloudPathUtils.join(root, filename);
        this.uploadingFiles.push(nodeFilePath);

        const obs = this.storageService.uploadFile(this._containerId, filePath, blobName).flatMap((result) => {
            this.uploadingFiles = this.uploadingFiles.filter(x => x !== nodeFilePath);
            this.changeDetector.detectChanges();
            const sas: SharedAccessPolicy = {
                AccessPolicy: {
                    Permissions: BlobUtilities.SharedAccessPermissions.READ,
                    Start: new Date(),
                    Expiry: moment().add(1, "week").toDate(),
                },
            };
            return this.storageService.generateSharedAccessBlobUrl(this._containerId, blobName, sas).do((url) => {
                this._addResourceFile(url, nodeFilePath);
            });
        }).share();
        this.upload.emit({ filename: nodeFilePath, done: obs });
        obs.subscribe();
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
