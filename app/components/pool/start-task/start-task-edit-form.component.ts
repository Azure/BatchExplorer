import { Component, EventEmitter, Output } from "@angular/core";
import { FormBuilder, FormGroup } from "@angular/forms";
import { autobind } from "core-decorators";

import { NotificationService } from "app/components/base/notifications";
import { SidebarRef } from "app/components/base/sidebar";
import { Pool, StartTask } from "app/models";
import { PoolService } from "app/services";

@Component({
    selector: "bl-start-task-edit-form",
    templateUrl: "start-task-edit-form.html",
})
export class StartTaskEditFormComponent {
    @Output()
    public close = new EventEmitter();

    public set pool(pool: Pool) {
        this._pool = pool;
        this._startTask = pool.startTask;
        if (!this.form.dirty) {
            this.form.patchValue({
                enableStartTask: Boolean(pool.startTask),
                startTask: pool.startTask && pool.startTask.toJS(),
            });
        }
    }

    public get pool() { return this._pool; }

    public form: FormGroup;

    private _pool: Pool;
    private _startTask: StartTask;

    constructor(
        formBuilder: FormBuilder,
        private poolService: PoolService,
        public sidebarRef: SidebarRef<any>,
        notificationService: NotificationService) {
        this.form = formBuilder.group({
            enableStartTask: [false],
            startTask: [null],
        });
    }

    public get enableStartTask() {
        return this.form.controls["enableStartTask"].value;
    }

    public closeForm() {
        this.close.emit();
    }

    @autobind()
    public submit() {
        const { enableStartTask, startTask } = this.form.value;
        const id = this._pool.id;
        let obs;
        console.log("Patch");
        if (startTask && enableStartTask) {
            console.log("updating...");
            obs = this.poolService.patch(id, {
                startTask: startTask,
            });
        } else {
            console.log("REmaing");
            obs = this.poolService.getOnce(this.pool.id).cascade((pool) => {
                const poolData = pool.toJS();
                return this.poolService.replaceProperties(id, {
                    applicationPackageReferences: poolData.applicationPackageReferences || [],
                    certificateReferences: poolData.certificateReferences || [],
                    metadata: poolData.metadata || [],
                });
            });
        }
        return obs.cascade(() => {
            return this.poolService.getOnce(id); // Refresh the pool
        });
    }
}
