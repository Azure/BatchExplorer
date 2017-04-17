import { Component, Input } from "@angular/core";
import { FormBuilder, FormControl } from "@angular/forms";
import { autobind } from "core-decorators";
import * as moment from "moment";
import { Observable } from "rxjs";

import { NotificationService } from "app/components/base/notifications";
import { SidebarRef } from "app/components/base/sidebar";
import { Pool } from "app/models";
import { PoolScaleModel } from "app/models/forms";
import { PoolService } from "app/services";
import { PoolEnableAutoScaleDto } from "app/models/dtos";

@Component({
    selector: "bl-pool-resize-dialog",
    templateUrl: "pool-resize-dialog.html",
})
export class PoolResizeDialogComponent {
    @Input()
    public set pool(pool: Pool) {
        if (pool) {
            this._pool = pool;
            this.scale.patchValue({
                targetDedicated: pool.targetDedicated,
                enableAutoScale: pool.enableAutoScale,
                autoscaleForumla: pool.autoScaleFormula,
                autoScaleFormulaInterval: pool.autoScaleEvaluationInterval,
            });
        }
    }
    public get pool() { return this._pool; }
    public scale: FormControl;

    private _pool: Pool;

    constructor(
        private formBuilder: FormBuilder,
        public sidebarRef: SidebarRef<PoolResizeDialogComponent>,
        private notificationService: NotificationService,
        private poolService: PoolService) {
        this.scale = this.formBuilder.control({
            scale: [null],
        });
    }

    @autobind()
    public submit() {
        const id = this.pool.id;
        const value: PoolScaleModel = this.scale.value;
        let obs;
        if (value.enableAutoScale) {
            obs = this._enableAutoScale(value);
        } else {
            const targetDedicated = value.targetDedicated;
            obs = this._disableAutoScale().flatMap(() => this.poolService.resize(id, targetDedicated));
        }

        const finalObs = obs.flatMap(() => this.poolService.getOnce(this.pool.id)).share();
        finalObs.subscribe({
            next: (pool) => {
                this.notificationService.success("Pool resize started!",
                    `Pool '${id}' will resize to ${pool.targetDedicated} nodes!`);
            },
            error: () => null,
        });
        return finalObs;
    }

    private _enableAutoScale(value: PoolScaleModel) {
        if (this.pool.enableAutoScale) {
            return Observable.of({});
        } else {
            const dto = new PoolEnableAutoScaleDto({
                autoScaleFormula: value.autoScaleFormula,
                autoScaleEvaluationInterval: moment.duration(value.autoScaleEvaluationInterval, "minutes") as any,
            });
            return this.poolService.enableAutoScale(this.pool.id, dto);
        }
    }

    private _disableAutoScale() {
        console.log("Disable autoscale");
        if (this.pool.enableAutoScale) {
            console.log("Acctually disabling autoscale");
            return this.poolService.disableAutoscale(this.pool.id);
        } else {
            return Observable.of({});
        }
    }
}
