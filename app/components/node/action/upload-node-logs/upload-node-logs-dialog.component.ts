import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from "@angular/core";
import { MatDialogRef } from "@angular/material";
import { autobind } from "@batch-flask/core";
import { BackgroundTaskService, NotificationService } from "@batch-flask/ui";
import { StorageService } from "app/services";
import { CloudPathUtils } from "app/utils";
import * as moment from "moment";

import { Node, Pool } from "app/models";

import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { AsyncSubject, Observable } from "rxjs";
import "./upload-node-logs-dialog.scss";

enum TimeRangePreset {
    LastDay,
    SinceReboot,
    SinceCreated,
}

@Component({
    selector: "bl-upload-node-logs-dialog",
    templateUrl: "upload-node-logs-dialog.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UploadNodeLogsDialogComponent {
    public TimeRangePreset = TimeRangePreset;

    public set pool(pool: Pool) {
        this._pool = pool;
        this.changeDetector.markForCheck();
    }
    public get pool() { return this._pool; }

    public set node(node: Node) {
        this._node = node;
        this.changeDetector.markForCheck();
    }
    public get node() { return this._node; }

    public form: FormGroup;
    public warningTimeRange = false;
    private _pool: Pool;
    private _node: Node;

    constructor(
        public dialogRef: MatDialogRef<UploadNodeLogsDialogComponent>,
        private changeDetector: ChangeDetectorRef,
        private backgroundTaskService: BackgroundTaskService,
        private storageService: StorageService,
        private notificationService: NotificationService,
        private router: Router,
        formBuilder: FormBuilder,
    ) {
        this.form = formBuilder.group({
            container: ["", Validators.required],
            startTime: [moment().subtract(1, "hour").toDate(), Validators.required],
            endTime: [new Date(), Validators.required],
        });

        this.form.valueChanges.debounceTime(400).distinctUntilChanged().subscribe((value) => {
            const diff = moment.duration(moment(value.endTime).diff(value.startTime));
            this.warningTimeRange = diff.asDays() > 1;
            this.changeDetector.markForCheck();
        });
    }

    public setPreset(preset: TimeRangePreset) {
        const now = new Date();
        let startTime;
        switch (preset) {
            case TimeRangePreset.LastDay:
                startTime = moment(now).subtract(24, "hour");
                break;
            case TimeRangePreset.SinceCreated:
                startTime = this.node.allocationTime;
                break;
            case TimeRangePreset.SinceReboot:
                startTime = this.node.lastBootTime;
                break;
        }
        this.form.patchValue({ startTime, endTime: now });
    }

    @autobind()
    public submit() {
        this._watchUpload("abc", "svg", 10);
        return Observable.of(null);
    }

    private _watchUpload(container: string, folder: string, numberOfFiles: number) {
        this.backgroundTaskService.startTask("Node logs uploading", (task) => {
            const done = new AsyncSubject();
            const sub = Observable.interval(5000)
                .flatMap(() => {
                    return this.storageService.listBlobs(container, {
                        folder: CloudPathUtils.asBaseDirectory(folder),
                    }, true);
                })
                .subscribe((blobs) => {
                    const uploaded = blobs.items.size;
                    if (uploaded >= numberOfFiles) {
                        task.progress.next(100);
                        done.complete();
                        sub.unsubscribe();
                        this._notifyLogUploaded(container, folder, numberOfFiles);
                    } else {
                        task.name.next(`Node logs uploading (${uploaded}/${numberOfFiles})`);
                        task.progress.next(uploaded / numberOfFiles * 100);
                    }
                });

            return done;
        });
    }

    private _notifyLogUploaded(container: string, folder: string, numberOfFiles: number)  {
        this.notificationService.success(`Node ${this.node.id} logs have been uploaded`,
            `${numberOfFiles} were uploaded under ${folder} in ${container} container`, {
                action: () => {
                    this.router.navigate(["/data", container]);
                },
            });
    }
}
