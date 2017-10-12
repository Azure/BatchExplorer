import { Component, EventEmitter, Output } from "@angular/core";
import { FormBuilder, FormGroup } from "@angular/forms";
import { autobind } from "core-decorators";

import { NotificationService } from "app/components/base/notifications";
import { SidebarRef } from "app/components/base/sidebar";
import { Pool, StartTask } from "app/models";
import { PoolPatchDto } from "app/models/dtos";
import { NodeService, PoolService } from "app/services";

@Component({
    selector: "bl-start-task-edit-form",
    templateUrl: "start-task-edit-form.html",
})
export class StartTaskEditFormComponent {
    /**
     * If editing start task from the node give the node id.
     */
    public fromNode: string;

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
        private nodeService: NodeService,
        public sidebarRef: SidebarRef<any>,
        private notificationService: NotificationService) {
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
        if (startTask && enableStartTask) {
            obs = this.poolService.patch(id, new PoolPatchDto({
                startTask: startTask,
            }));
        } else {
            obs = this.poolService.getOnce(this.pool.id).cascade((pool) => {
                const poolData = pool.toJS();
                return this.poolService.replaceProperties(id, new PoolPatchDto({
                    applicationPackageReferences: poolData.applicationPackageReferences || [],
                    certificateReferences: poolData.certificateReferences || [],
                    metadata: poolData.metadata || [],
                }));
            });
        }
        return obs.cascade(() => {
            this._notifySuccess();
            return this.poolService.getOnce(id); // Refresh the pool

        });
    }

    public reboot() {
        this.nodeService.reboot(this.pool.id, this.fromNode).subscribe(() => {
            this.notificationService.success("Rebooting", `Node is now rebooting`);
        });
    }

    private _notifySuccess() {
        const actions = [
            { name: "Reboot all", do: () => this.nodeService.rebootAll(this.pool.id) },
        ];

        if (this.fromNode) {
            actions.push(
                { name: "Reboot node", do: () => this.reboot() },
            );
        }
        this.notificationService.success("Updated", `Pool ${this.pool.id} start task was updated`, {
            persist: true,
            actions: actions,
        });
    }
}
