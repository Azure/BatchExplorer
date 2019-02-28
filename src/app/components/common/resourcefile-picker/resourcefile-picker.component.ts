import {
    ChangeDetectorRef, Component, EventEmitter, HostListener, Input, OnDestroy, Output, forwardRef,
} from "@angular/core";
import {
    ControlValueAccessor, FormArray, FormBuilder, FormControl, NG_VALIDATORS, NG_VALUE_ACCESSOR,
} from "@angular/forms";
import { UserConfigurationService } from "@batch-flask/core";
import { FileSystemService } from "@batch-flask/electron";
import { DialogService } from "@batch-flask/ui";
import { CloudPathUtils, DragUtils, SecureUtils, UrlUtils } from "@batch-flask/utils";
import { ResourceFileAttributes } from "app/models";
import { AutoStorageService, StorageBlobService, StorageContainerService } from "app/services/storage";
import { SharedAccessPolicy } from "app/services/storage/models";
import { BlobUtilities } from "azure-storage";
import { BEUserConfiguration } from "common";
import { DateTime } from "luxon";
import * as path from "path";
import { Observable, Subject } from "rxjs";
import { flatMap, share, takeUntil, tap } from "rxjs/operators";
import { ResourceFileCloudFileDialogComponent } from "./resourcefile-cloud-file-dialog";

import "./resourcefile-picker.scss";

export interface UploadResourceFileEvent {
    filename: string;
    done: Observable<any>;
}

@Component({
    selector: "bl-resourcefile-picker",
    templateUrl: "resourcefile-picker.html",
    providers: [
        { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => ResourcefilePickerComponent), multi: true },
        { provide: NG_VALIDATORS, useExisting: forwardRef(() => ResourcefilePickerComponent), multi: true },
    ],
})
export class ResourcefilePickerComponent implements ControlValueAccessor, OnDestroy {
    @Input() public label = "Resource files";
    @Input() public hideCaption = false;
    /**
     * Event emitted when a file is being uploaded, use this to add async task to the form
     */
    @Output() public upload = new EventEmitter();
    public files: FormArray;
    public isDraging = 0;
    public uploadingFiles: string[] = [];

    private _propagateChange: ((value: ResourceFileAttributes[]) => void) | null = null;
    private _destroy = new Subject();
    private _containerId: string;

    /**
     * Unique id generated for this
     */
    private _folderId: string;

    constructor(
        private formBuilder: FormBuilder,
        private autoStorageService: AutoStorageService,
        private storageBlobService: StorageBlobService,
        private storageContainerService: StorageContainerService,
        private fs: FileSystemService,
        private dialogService: DialogService,
        private settingsService: UserConfigurationService<BEUserConfiguration>,
        private changeDetector: ChangeDetectorRef) {
        this._folderId = SecureUtils.uuid();

        this.files = this.formBuilder.array([]);

        this.files.valueChanges.pipe(takeUntil(this._destroy)).subscribe((files) => {
            if (this._propagateChange) {
                this._propagateChange(files);
            }
        });

        this.settingsService.watch("storage").pipe(takeUntil(this._destroy)).subscribe((storage) => {
            this._containerId = storage.defaultUploadContainer;
        });
    }

    public ngOnDestroy() {
        this._destroy.next();
        this._destroy.complete();
    }

    public writeValue(value: ResourceFileAttributes[]) {
        if (value) {
            this.files.controls = this.formBuilder.array(value).controls;
        }
    }

    public addUrlResourceFile() {
        this.files.push(new FormControl({ httpUrl: "", filePath: "" }));
        this.changeDetector.markForCheck();
    }

    public pickFromAzureStorage() {
        const ref = this.dialogService.open(ResourceFileCloudFileDialogComponent);
        ref.afterClosed().subscribe((file) => {
            if (file) {
                this.files.push(new FormControl(file));
                this.changeDetector.markForCheck();
            }
        });
    }

    public removeRow(i: number) {
        this.files.removeAt(i);
        this.changeDetector.markForCheck();
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
        const allowDrop = this._canDrop(event.dataTransfer!);
        DragUtils.allowDrop(event, allowDrop);
    }

    @HostListener("dragenter", ["$event"])
    public dragEnter(event: DragEvent) {
        if (!this._canDrop(event.dataTransfer!)) { return; }
        event.stopPropagation();
        this.isDraging++;
    }

    @HostListener("dragleave", ["$event"])
    public dragLeave(event: DragEvent) {
        if (!this._canDrop(event.dataTransfer!)) { return; }
        this.isDraging--;
    }

    @HostListener("drop", ["$event"])
    public handleDrop(event: DragEvent) {
        event.preventDefault();
        event.stopPropagation();
        const dataTransfer = event.dataTransfer;
        const files = [...event.dataTransfer!.files as any];
        if (this._hasLink(dataTransfer!)) {
            const link = dataTransfer!.getData("text/uri-list");
            if (UrlUtils.isHttpUrl(link)) {
                this._addResourceFileFromUrl(link);
            }
        } else if (this._hasFile(dataTransfer!)) {
            this.uploadFiles(files.map(x => x.path));
        }
        this.isDraging = 0;
    }

    /**
     * Upload files to storage and add then to the resource files list
     * @param files: List of files or folder
     * @returns async when the all  file upload started
     */
    public async uploadFiles(files: string[], root = "") {
        const storageAccountId = await this.autoStorageService.get().toPromise();
        await this.storageContainerService.createIfNotExists(storageAccountId, this._containerId).toPromise();
        for (const file of files) {
            await this._uploadPath(file, root);
        }
    }

    public trackUploadingFile(index, file: string) {
        return file;
    }

    private _addResourceFileFromUrl(url: string) {
        this._addResourceFile(url, path.basename(url));
    }

    private async _uploadPath(filePath: string, root = "") {
        const stats = await this.fs.lstat(filePath);
        if (stats.isFile()) {
            this._uploadFile(filePath, root);
        } else {
            const files = await this.fs.readdir(filePath);
            const paths = files.map(x => path.join(filePath, x));
            await this.uploadFiles(paths, CloudPathUtils.join(root, path.basename(filePath)));
        }
    }

    private _uploadFile(filePath: string, root = "") {
        const filename = path.basename(filePath);
        const nodeFilePath = CloudPathUtils.join(root, filename);
        const blobName = CloudPathUtils.join("resource-files", this._folderId, root, filename);
        this.uploadingFiles.push(nodeFilePath);
        const obs = this.autoStorageService.get().pipe(
            flatMap((storageAccountId) => {
                return this.storageBlobService.uploadFile(storageAccountId, this._containerId, filePath, blobName).pipe(
                    flatMap((result) => {
                        this.uploadingFiles = this.uploadingFiles.filter(x => x !== nodeFilePath);
                        this.changeDetector.detectChanges();
                        const sas: SharedAccessPolicy = {
                            AccessPolicy: {
                                Permissions: BlobUtilities.SharedAccessPermissions.READ,
                                Start: new Date(),
                                Expiry: DateTime.local().plus({ weeks: 1 }).toJSDate(),
                            },
                        };
                        return this.storageBlobService.generateSharedAccessBlobUrl(storageAccountId,
                            this._containerId,
                            blobName,
                            sas).pipe(tap((url) => {
                                this._addResourceFile(url, nodeFilePath);
                            }));
                    }),
                );
            }),
            share(),
        );
        this.upload.emit({ filename: nodeFilePath, done: obs });
        obs.subscribe();
    }

    private _addResourceFile(httpUrl: string, filePath: string) {
        this.files.push(new FormControl({
            httpUrl,
            filePath,
        }));
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
