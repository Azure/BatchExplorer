import { Component, EventEmitter, Input, Output } from "@angular/core";
import { FormBuilder, FormGroup } from "@angular/forms";
import { autobind } from "core-decorators";

import { NotificationManager } from "app/components/base/notifications";
import { Pool, StartTask } from "app/models";
import { PoolService } from "app/services";

@Component({
    selector: "bex-start-task-edit-form",
    templateUrl: "start-task-edit-form.html",
})
export class StartTaskEditFormComponent {
    @Output()
    public close = new EventEmitter();

    @Input()
    public set pool(pool: Pool) {
        this._pool = pool;
        this._startTask = pool.startTask;
        this.form.patchValue({
            startTask: pool.startTask && pool.startTask.toJS(),
        });
    }

    public get pool() { return this._pool; };

    public form: FormGroup;

    private _pool: Pool;
    private _startTask: StartTask;

    constructor(
        private formBuilder: FormBuilder,
        private poolService: PoolService,
        private notificationManager: NotificationManager) {
        this.form = formBuilder.group({
            startTask: [null],
        });
    }

    @autobind()
    public submit() {
        const startTask = this.form.value.startTask;
        const id = this._pool.id;
        let obs;
        if (startTask) {
            obs = this.poolService.patch(id, {
                startTask: startTask,
            });
        } else {
            obs = this.poolService.getOnce(this.pool.id).cascade((pool) => {
                return this.poolService.replaceProperties(id, {
                    applicationPackageReferences: pool.applicationPackageReferences,
                    certificateReferences: pool.certificateReferences,
                    metadata: pool.metadata,
                });
            });
        }
        obs.subscribe(() => {
            this.poolService.getOnce(id); // Refresh the pool
        });
        return obs;
    }
}
