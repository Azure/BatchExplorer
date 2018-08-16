import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { MatDialogRef } from "@angular/material";
import { Router } from "@angular/router";
import { autobind } from "@batch-flask/core";
import { Activity, ActivityResponse, ActivityService } from "@batch-flask/ui/activity-monitor";
import { NotificationService } from "@batch-flask/ui/notifications";
import { Node, Pool } from "app/models";
import { AccountService, NodeService } from "app/services";
import { AutoStorageService, StorageBlobService } from "app/services/storage";
import { CloudPathUtils, StorageUtils } from "app/utils";
import * as moment from "moment";
import { interval } from "rxjs";
import { distinctUntilChanged, first, flatMap, map, share, takeWhile } from "rxjs/operators";

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
        private activityService: ActivityService,
        private nodeService: NodeService,
        private accountService: AccountService,
        private autoStorageService: AutoStorageService,
        private storageBlobService: StorageBlobService,
        private notificationService: NotificationService,
        private router: Router,
        formBuilder: FormBuilder,
    ) {
        this.form = formBuilder.group({
            container: ["", Validators.required],
            startTime: [moment().subtract(2, "hour").toDate(), Validators.required],
            endTime: [new Date(), Validators.required],
        });

        this.form.valueChanges.pipe(distinctUntilChanged()).subscribe((value) => {
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
                startTime = moment(now).subtract(24, "hour").toDate();
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
        const value = this.form.value;
        const obs = this.nodeService.uploadLogs(this.pool.id, this.node.id, {
            containerUrl: value.container,
            startTime: value.startTime,
            endTime: value.endTime,
        });

        obs.subscribe((result) => {
            const { container, account } = StorageUtils.getContainerFromUrl(value.container);
            this.accountService.currentAccount.pipe(first()).subscribe((batchAccount) => {
                if (batchAccount.autoStorage && batchAccount.autoStorage.storageAccountId.contains(account)) {
                    this._watchUpload(container, result.virtualDirectoryName, result.numberOfFilesUploaded);
                } else {
                    this.notificationService.info("Uploading node logs",
                        `Azure batch node agent  ${result.numberOfFilesUploaded} logs files ` +
                        `are being uploaded to container ${container}`);
                }
            });
        }, () => null);
        return obs;
    }

    /**
     * Watch the specified container for log file uploads from the node,
     * and continuously report status to the activity service
     * @param container the Azure Storage container url that we are uploading files to
     * @param folder the name of the virtual directory where these files are being stored
     * @param numberOfFiles the number of files we are uploading
     */
    private _watchUpload(container: string, folder: string, numberOfFiles: number) {
        // the initializer calls the storage service, lists the uploaded files
        // and maps this to a progress number to report to the activity
        const initializer = () => {
            return interval(5000).pipe(
                flatMap(() => this.autoStorageService.get()),
                flatMap((storageAccountId) => {
                    return this.storageBlobService.list(storageAccountId, container, {
                        folder: CloudPathUtils.asBaseDirectory(folder),
                    });
                }),
                takeWhile((blobs) => blobs.items.size < numberOfFiles),
                map((blobs) => {
                    const progress = (blobs.items.size / numberOfFiles) * 100;
                    return new ActivityResponse(progress);
                }),
                share(),
            );
        };

        initializer().subscribe({
            complete: () => {
                this._notifyLogUploaded(container, folder, numberOfFiles);
            },
        });

        // create the main listening activity
        const mainName = `Uploading ${numberOfFiles} log files ` +
            `for node '${this.node.id}' of pool '${this.pool.id}' to '${container}'`;
        const mainActivity = new Activity(mainName, initializer);
        this.activityService.exec(mainActivity);

        return mainActivity.done;
    }

    private _notifyLogUploaded(container: string, folder: string, numberOfFiles: number) {
        this.notificationService.success(`Node ${this.node.id} logs have been uploaded`,
            `${numberOfFiles} were uploaded under ${folder} in ${container} container`, {
                action: () => {
                    this.router.navigate(["/data", container]);
                },
            });
    }
}
