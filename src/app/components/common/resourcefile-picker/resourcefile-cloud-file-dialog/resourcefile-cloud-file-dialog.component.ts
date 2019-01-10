import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { MatDialogRef } from "@angular/material";
import { autobind } from "@batch-flask/core";
import { FileExplorerConfig, FileExplorerSelectable } from "@batch-flask/ui";
import { ArmBatchAccount, ResourceFileAttributes } from "app/models";
import { AutoStorageService, StorageBlobService, StorageContainerService } from "app/services/storage";
import { SharedAccessPolicy } from "app/services/storage/models";
import { BlobUtilities } from "azure-storage";
import { DateTime } from "luxon";
import { BehaviorSubject, Observable, Subject, of } from "rxjs";
import {
    distinctUntilChanged, filter, map, publishReplay, refCount, skip, switchMap, take, takeUntil, tap,
} from "rxjs/operators";

import { BatchAccountService, StorageAccountService } from "app/services";
import { ArmResourceUtils, StorageUtils } from "app/utils";
import "./resourcefile-cloud-file-dialog.scss";

@Component({
    selector: "bl-resourcefile-cloud-file-dialog",
    templateUrl: "resourcefile-cloud-file-dialog.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResourceFileCloudFileDialogComponent implements OnInit, OnDestroy {

    public form: FormGroup;
    public storageAccountName: string | null;
    public storageAccountId: string | null;
    public containerName: string | null;
    public pickedFile: string | null;
    public currentSelection: ResourceFileAttributes;

    public fileExplorerConfig: FileExplorerConfig = {
        selectable: FileExplorerSelectable.all,
    };
    public _autoStorageAccountId: string;
    private _status = new BehaviorSubject(null);
    private _destroy = new Subject();
    private _resourceFile: Observable<ResourceFileAttributes>;

    constructor(
        private changeDetector: ChangeDetectorRef,
        private formBuilder: FormBuilder,
        private accountService: BatchAccountService,
        private storageAccountService: StorageAccountService,
        private autoStorageService: AutoStorageService,
        private containerService: StorageContainerService,
        private blobService: StorageBlobService,
        public dialogRef: MatDialogRef<any, ResourceFileAttributes>) {

        this.form = this.formBuilder.group(
            {
                storageAccountId: [null, Validators.required],
                containerName: [null, Validators.required],
                path: [""],
            },
        );

        this.form.controls.storageAccountId.valueChanges.pipe(
            takeUntil(this._destroy),
            distinctUntilChanged(),
        ).subscribe((storageAccountId) => {
            this.storageAccountId = storageAccountId;
            this.storageAccountName = storageAccountId
                && ArmResourceUtils.getAccountNameFromResourceId(storageAccountId);
            this.form.patchValue({ containerName: null });
            this.changeDetector.markForCheck();
        });

        this.form.controls.containerName.valueChanges.pipe(
            takeUntil(this._destroy),
            distinctUntilChanged(),
        ).subscribe((containerName) => {
            this.containerName = containerName;
            this.updatePickedFile(null);
            this.changeDetector.markForCheck();
        });

        this.form.controls.path.valueChanges.pipe(
            takeUntil(this._destroy),
            distinctUntilChanged(),
        ).subscribe((path) => {
            this.pickedFile = path;
            this.changeDetector.markForCheck();
        });

        this._resourceFile = this.form.valueChanges.pipe(
            takeUntil(this._destroy),
            tap(() => {
                this.currentSelection = null;
                this._status.next(null);
                this.changeDetector.markForCheck();
            }),
            filter(({ storageAccountId, containerName }) => storageAccountId && containerName),
            switchMap(({ storageAccountId, containerName, path }) => {
                return this._checkIfDir(storageAccountId, containerName, path).pipe(
                    switchMap((isDirectory) => {
                        if (isDirectory) {
                            return this._createResourceFileFromContainer(storageAccountId, containerName, path);
                        } else {
                            return this._createResourceFileFromBlob(storageAccountId, containerName, path);
                        }
                    }),
                );
            }),
            publishReplay(1),
            refCount(),
        );

        this._resourceFile.subscribe((value: ResourceFileAttributes | null) => {
            this.currentSelection = value;
            this._status.next(value ? true : false);
            this.changeDetector.markForCheck();
        });
    }

    public ngOnInit() {
        this.autoStorageService.get().subscribe((storageAccountId) => {
            this._autoStorageAccountId = storageAccountId;
            if (!this.storageAccountId) {
                this.form.patchValue({ storageAccountId });
            }
        });
    }

    public ngOnDestroy() {
        this._destroy.next();
        this._destroy.complete();
    }

    public async setFile(file: ResourceFileAttributes) {
        if (file.storageContainerUrl) {
            const result = StorageUtils.getContainerFromUrl(file.storageContainerUrl);
            const account = await this._findAccountId(result.account).toPromise();
            if (!account) {
                return;
            }
            return this._applyValues({
                storageAccountId: account.id,
                containerName: result.container,
                blobPrefix: file.blobPrefix,
            });
        } else if (file.autoStorageContainerName) {
            const storageAccountId = await this.autoStorageService.get().toPromise();
            return this._applyValues({
                storageAccountId: storageAccountId,
                containerName: file.autoStorageContainerName,
                blobPrefix: file.blobPrefix,
            });
        }
    }

    public updatePickedFile(file: string) {
        this.form.patchValue({ path: file });
        this.changeDetector.markForCheck();
    }

    @autobind()
    public submit() {
        return this._resourceFile.pipe(
            skip(this.currentSelection ? 0 : 1), // Skip last value if we are resolving a new one
            tap((file) => {
                this.dialogRef.close(file);
            }),
        );
    }

    public close() {
        this.dialogRef.close(null);
    }

    private _checkIfDir(storageAccountId: string, containerName: string, path: string): Observable<boolean | null> {
        if (!path || path === "/") {
            return of(true);
        }

        return this.blobService.list(storageAccountId, containerName,
            {
                folder: path,
                limit: 1,
            },
            true,
        ).pipe(
            map((response) => {
                if (response.items.size === 0) {
                    return null;
                }
                const item = response.items.first();
                return item.isDirectory;
            }),
        );
    }

    private _createResourceFileFromContainer(
        storageAccountId: string,
        containerName: string,
        folder: string): Observable<ResourceFileAttributes> {

        if (storageAccountId === this._autoStorageAccountId) {
            return of({ filePath: "", autoStorageContainerName: this.containerName, blobPrefix: folder });
        }

        const sas: SharedAccessPolicy = {
            AccessPolicy: {
                Permissions: BlobUtilities.SharedAccessPermissions.READ,
                Start: new Date(),
                Expiry: DateTime.local().plus({ weeks: 1 }).toJSDate(),
            },
        };

        return this.containerService.generateSharedAccessUrl(
            storageAccountId,
            containerName,
            sas).pipe(
                map((storageContainerUrl) => {
                    return { filePath: "", storageContainerUrl, blobPrefix: folder };
                }),
            );
    }

    private _createResourceFileFromBlob(
        storageAccountId: string,
        containerName: string,
        file: string): Observable<ResourceFileAttributes> {

        const sas: SharedAccessPolicy = {
            AccessPolicy: {
                Permissions: BlobUtilities.SharedAccessPermissions.READ,
                Start: new Date(),
                Expiry: DateTime.local().plus({ weeks: 1 }).toJSDate(),
            },
        };

        return this.blobService.generateSharedAccessBlobUrl(
            storageAccountId,
            containerName,
            file,
            sas).pipe(
                map((httpUrl) => {
                    return { httpUrl, filePath: "" };
                }),
            );
    }

    private _findAccountId(name: string) {
        return this.accountService.currentAccount.pipe(
            take(1),
            switchMap((account) => {
                if (account instanceof ArmBatchAccount) {
                    return this.storageAccountService.findByName(account.subscription.subscriptionId, name);
                } else {
                    return of(null);
                }
            }),
        );
    }

    private async _applyValues(data) {
        this.form.patchValue({
            storageAccountId: data.storageAccountId,
        });
        await Promise.resolve(); // Just wait for the patchValue to trigger the events
        this.form.patchValue({
            containerName: data.containerName,
        });
        await Promise.resolve(); // Just wait for the patchValue to trigger the events
        this.updatePickedFile(data.blobPrefix);
    }
}
