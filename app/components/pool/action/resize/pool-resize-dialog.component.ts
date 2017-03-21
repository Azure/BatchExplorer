import { Component, Input } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { autobind } from "core-decorators";

import { NotificationService } from "app/components/base/notifications";
import { SidebarRef } from "app/components/base/sidebar";
import { Pool } from "app/models";
import { PoolService } from "app/services";
import { CustomValidators } from "app/utils";

@Component({
    selector: "bl-pool-resize-dialog",
    templateUrl: "pool-resize-dialog.html",
})
export class PoolResizeDialogComponent {
    @Input()
    public set pool(pool: Pool) {
        if (pool) {
            this._pool = pool;
            this.form.patchValue({
                targetDedicated: pool.targetDedicated,
            });
        }
    }
    public get pool() { return this._pool; }
    public form: FormGroup;

    private _pool: Pool;

    constructor(
        private formBuilder: FormBuilder,
        public sidebarRef: SidebarRef<PoolResizeDialogComponent>,
        private notificationService: NotificationService,
        private poolService: PoolService) {
        this.form = this.formBuilder.group({
            targetDedicated: [0, [Validators.required, CustomValidators.number, CustomValidators.min(0)]],
        });
    }

    @autobind()
    public submit() {
        const id = this.pool.id;
        const targetDedicated = this.form.value.targetDedicated;
        const obs = this.poolService.resize(id, targetDedicated, {});

        obs.subscribe({
            complete: () => {
                this.notificationService.success("Pool resize started!",
                    `Pool '${id}' will resize to ${targetDedicated} nodes!`);
            },
            error: () => null,
        });
        return obs;
    }
}
