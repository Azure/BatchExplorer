import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from "@angular/core";
import { MatDialogRef } from "@angular/material";
import { autobind } from "@batch-flask/core";
import * as moment from "moment";

import { Node, Pool } from "app/models";

import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import "./upload-node-logs-dialog.scss";

enum TimeRangePreset {
    LastDay,
    SinceReboot,
    SinceCreated,
}

@Component({
    selector: "bl-upload-node-logs-dialog",
    templateUrl: "upload-node-logs-dialog.html",
    // changeDetection: ChangeDetectionStrategy.OnPush,
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
        formBuilder: FormBuilder,
    ) {
        this.form = formBuilder.group({
            container: ["", Validators.required],
            startTime: [moment().subtract(1, "hour").toDate(), Validators.required],
            endTime: [new Date(), Validators.required],
        });
        console.log("Required valid", this.form.valid);

        this.form.valueChanges.debounceTime(400).distinctUntilChanged().subscribe((value) => {
            const diff = moment.duration(moment(value.endTime).diff(value.startTime));
            this.warningTimeRange = diff.asDays() > 1;
            this.changeDetector.markForCheck();
            console.log("Required valid", this.form.valid);
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
    public subbmit() {

    }
}
