import { Component, EventEmitter, Output } from "@angular/core";
import { FormBuilder, FormGroup } from "@angular/forms";
import { autobind } from "@batch-flask/core";

import { NotificationService } from "@batch-flask/ui/notifications";
import { SidebarRef } from "@batch-flask/ui/sidebar";
import { Pool } from "app/models";
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
            obs = this.poolService.get(this.pool.id).flatMap((pool) => {
                const poolData = pool.toJS();
                return this.poolService.replaceProperties(id, new PoolPatchDto({
                    applicationPackageReferences: poolData.applicationPackageReferences || [],
                    certificateReferences: poolData.certificateReferences || [],
                    metadata: poolData.metadata || [],
                }));
            });
        }
        return obs.flatMap(() => {
            this._notifySuccess();
            return this.poolService.get(id); // Refresh the pool

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
