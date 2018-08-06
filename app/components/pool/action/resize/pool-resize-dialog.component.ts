import { Component, Input } from "@angular/core";
import { FormBuilder, FormControl, FormGroup } from "@angular/forms";
import { autobind } from "@batch-flask/core";
import * as moment from "moment";

import { NotificationService } from "@batch-flask/ui/notifications";
import { SidebarRef } from "@batch-flask/ui/sidebar";
import { Pool } from "app/models";
import { NodeDeallocationOption, PoolEnableAutoScaleDto, PoolResizeDto } from "app/models/dtos";
import { PoolScaleModel } from "app/models/forms";
import { PoolService } from "app/services";
import { of } from "rxjs";
import { delay, flatMap, share } from "rxjs/operators";

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

    public form: FormGroup;
    public scale: FormControl;
    public taskAction: FormControl;

    private _pool: Pool;

    constructor(
        private formBuilder: FormBuilder,
        public sidebarRef: SidebarRef<PoolResizeDialogComponent>,
        private notificationService: NotificationService,
        private poolService: PoolService) {

        this.scale = this.formBuilder.control({
            scale: [null],
        });

        this.taskAction = this.formBuilder.control({
            nodeDeallocationOption: NodeDeallocationOption.requeue,
        });

        this.form = this.formBuilder.group({
            scale: this.scale,
            nodeDeallocationOption: this.taskAction,
        });
    }

    @autobind()
    public submit() {
        let obs;
        const value: PoolScaleModel = this.scale.value;
        if (value.enableAutoScale) {
            obs = this._enableAutoScale(value);
        } else {
            const targetDedicatedNodes = value.targetDedicatedNodes;
            const targetLowPriorityNodes = value.targetLowPriorityNodes;
            obs = this._disableAutoScale().pipe(
                flatMap(() => this.poolService.resize(this.pool.id, new PoolResizeDto({
                    nodeDeallocationOption: this.taskAction.value.nodeDeallocationOption,
                    resizeTimeout: moment.duration(value.resizeTimeout, "minutes") as any,
                    targetDedicatedNodes: targetDedicatedNodes,
                    targetLowPriorityNodes: targetLowPriorityNodes,
                }))),
            );
        }

        const finalObs = obs.pipe(flatMap(() => this.poolService.get(this.pool.id)), share());
        finalObs.subscribe({
            next: (pool) => {
                this.notificationService.success("Pool resize started!",
                    `Pool '${this.pool.id}' will resize to ${pool.targetNodes} nodes!`);
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
            return this.poolService.disableAutoScale(this.pool.id).pipe(delay(1000));
        } else {
            return of({});
        }
    }
}
