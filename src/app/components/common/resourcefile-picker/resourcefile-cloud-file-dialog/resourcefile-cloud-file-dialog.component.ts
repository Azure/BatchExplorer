import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy } from "@angular/core";
import { MatDialogRef } from "@angular/material";
import { autobind } from "@batch-flask/core";
import { ResourceFileAttributes } from "app/models";

import { FormBuilder, FormGroup } from "@angular/forms";
import { Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";
import "./resourcefile-cloud-file-dialog.scss";

@Component({
    selector: "bl-resourcefile-cloud-file-dialog",
    templateUrl: "resourcefile-cloud-file-dialog.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResourceFileCloudFileDialogComponent implements OnDestroy {
    public form: FormGroup;
    public storageAccountId: string | null;
    public containerName: string | null;

    private _destroy = new Subject();
    constructor(
        private changeDetector: ChangeDetectorRef,
        private formBuilder: FormBuilder,
        public dialogRef: MatDialogRef<any, ResourceFileAttributes>) {

        this.form = this.formBuilder.group({
            storageAccountId: [null],
            containerName: [null],
        });

        this.form.valueChanges.pipe(takeUntil(this._destroy)).subscribe((value) => {
            this.storageAccountId = value.storageAccountId;
            this.containerName = value.containerName;
            this.changeDetector.markForCheck();
        });
    }

    public ngOnDestroy() {
        this._destroy.next();
        this._destroy.complete();
    }
    @autobind()
    public submit() {
        this.dialogRef.close({ httpUrl: "foo", filePath: "" });
    }

    public close() {
        this.dialogRef.close(null);
    }
}
