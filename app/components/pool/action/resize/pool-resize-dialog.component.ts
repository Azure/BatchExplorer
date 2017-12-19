import { Component, Input } from "@angular/core";
import { FormBuilder, FormControl } from "@angular/forms";
import { autobind } from "app/core";
import * as moment from "moment";
import { Observable } from "rxjs";

import { NotificationService } from "app/components/base/notifications";
import { SidebarRef } from "app/components/base/sidebar";
import { Pool } from "app/models";
import { PoolEnableAutoScaleDto, PoolResizeDto } from "app/models/dtos";
import { PoolScaleModel } from "app/models/forms";
import { PoolService } from "app/services";

@Component({
    selector: "bl-pool-resize-dialog",
    templateUrl: "pool-resize-dialog.html",
})
export class PoolResizeDialogComponent {
    @Input()
    public set pool(pool: Pool) {
        if (pool) {
            this._pool = pool;
            const interval = pool.autoScaleEvaluationInterval ? pool.autoScaleEvaluationInterval.asMinutes() : 15;
            this.scale.patchValue({
                targetDedicatedNodes: pool.targetDedicatedNodes,
                targetLowPriorityNodes: pool.targetLowPriorityNodes,
                enableAutoScale: pool.enableAutoScale,
                autoScaleFormula: pool.autoScaleFormula,
                autoScaleEvaluationInterval: interval,
            } as PoolScaleModel);
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
            const targetDedicatedNodes = value.targetDedicatedNodes;
            const targetLowPriorityNodes = value.targetLowPriorityNodes;
            obs = this._disableAutoScale()
                .flatMap(() => this.poolService.resize(id, new PoolResizeDto({
                    targetDedicatedNodes, targetLowPriorityNodes,
                })));
        }

        const finalObs = obs.flatMap(() => this.poolService.get(this.pool.id)).share();
        finalObs.subscribe({
            next: (pool) => {
                this.notificationService.success("Pool resize started!",
                    `Pool '${id}' will resize to ${pool.targetNodes} nodes!`);
            },
            error: () => null,
        });
        return finalObs;
    }

    private _enableAutoScale(value: PoolScaleModel) {
        const dto = new PoolEnableAutoScaleDto({
            autoScaleFormula: value.autoScaleFormula,
            autoScaleEvaluationInterval: moment.duration(value.autoScaleEvaluationInterval, "minutes") as any,
        });
        return this.poolService.enableAutoScale(this.pool.id, dto);
    }

    private _disableAutoScale() {
        if (this.pool.enableAutoScale) {
            return this.poolService.disableAutoScale(this.pool.id).delay(1000);
        } else {
            return Observable.of({});
        }
    }
}
