import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from "@angular/core";
import { FormBuilder, FormGroup } from "@angular/forms";
import { MatDialogRef } from "@angular/material";
import { autobind } from "@batch-flask/core";
import { FileExplorerConfig, FileExplorerSelectable } from "@batch-flask/ui";
import { ResourceFileAttributes } from "app/models";
import { AutoStorageService, StorageBlobService } from "app/services/storage";
import { Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";

import "./resourcefile-cloud-file-dialog.scss";

@Component({
    selector: "bl-resourcefile-cloud-file-dialog",
    templateUrl: "resourcefile-cloud-file-dialog.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResourceFileCloudFileDialogComponent implements OnInit, OnDestroy {
    public form: FormGroup;
    public storageAccountId: string | null;
    public containerName: string | null;
    public pickedFile: string | null;

    public fileExplorerConfig: FileExplorerConfig = {
        selectable: FileExplorerSelectable.all,
    };
    private _destroy = new Subject();
    constructor(
        private changeDetector: ChangeDetectorRef,
        private formBuilder: FormBuilder,
        private autoStorageService: AutoStorageService,
        private blobService: StorageBlobService,
        public dialogRef: MatDialogRef<any, ResourceFileAttributes>) {

        this.form = this.formBuilder.group({
            storageAccountId: [null],
            containerName: [null],
        });

        this.form.controls.storageAccountId.valueChanges.pipe(
            takeUntil(this._destroy),
        ).subscribe((storageAccountId) => {
            this.storageAccountId = storageAccountId;
            this.form.patchValue({ containerName: null });
            this.changeDetector.markForCheck();
        });

        this.form.controls.containerName.valueChanges.pipe(takeUntil(this._destroy)).subscribe((containerName) => {
            this.containerName = containerName;
            this.pickedFile = null;
            this.changeDetector.markForCheck();
        });
    }

    public ngOnInit() {
        this.autoStorageService.get().subscribe((storageAccountId) => {
            if (!this.storageAccountId) {
                this.form.patchValue({ storageAccountId });
            }
        });
    }

    public ngOnDestroy() {
        this._destroy.next();
        this._destroy.complete();
    }

    public updatePickedFile(file: string) {
        this.pickedFile = file;
        this.changeDetector.markForCheck();
        console.log("File", file);
        if (file) {
            this.blobService.list(this.storageAccountId, this.containerName,
                {
                    folder: file,
                    limit: 1,
                },
                true,
            ).subscribe({
                next: (response) => {
                    console.log("NExt", response.items.toJS());
                    if (response.items.size === 0) {
                        return;
                    }
                    const item = response.items.first();
                    console.log("Is directory", item.isDirectory);
                },
            });
        }
    }

    @autobind()
    public submit() {
        this.dialogRef.close({ httpUrl: "foo", filePath: "" });
    }

    public close() {
        this.dialogRef.close(null);
    }
}
