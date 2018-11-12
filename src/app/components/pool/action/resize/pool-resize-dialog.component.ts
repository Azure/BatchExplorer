import { ChangeDetectionStrategy, Component, Input } from "@angular/core";
import { FormBuilder, FormControl, FormGroup } from "@angular/forms";
import { ServerError, autobind } from "@batch-flask/core";
import * as moment from "moment";

import { NotificationService } from "@batch-flask/ui/notifications";
import { SidebarRef } from "@batch-flask/ui/sidebar";
import { Pool, PoolAllocationState } from "app/models";
import { NodeDeallocationOption, PoolEnableAutoScaleDto, PoolResizeDto } from "app/models/dtos";
import { PoolService } from "app/services";
import { interval, of, throwError } from "rxjs";
import { filter, share, switchMap, take, timeoutWith } from "rxjs/operators";
import { PoolScaleSelection } from "../scale";

@Component({
    selector: "bl-pool-resize-dialog",
    templateUrl: "pool-resize-dialog.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PoolResizeDialogComponent {
    @Input()
    public set pool(pool: Pool) {
        if (pool) {
            this._pool = pool;
            this.scale.patchValue({
                enableAutoScale: pool.enableAutoScale,
                targetDedicatedNodes: pool.targetDedicatedNodes,
                targetLowPriorityNodes: pool.targetLowPriorityNodes,
                autoScaleFormula: pool.autoScaleFormula,
                autoScaleEvaluationInterval: pool.autoScaleEvaluationInterval,
            } as PoolScaleSelection);
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
        const value: PoolScaleSelection = this.scale.value;
        if (value.enableAutoScale) {
            obs = this._enableAutoScale(value);
        } else if (value.enableAutoScale === false) {
            obs = this._resizeToFixed(value);
        }

        const finalObs = obs.pipe(switchMap(() => this.poolService.get(this.pool.id)), share());
        finalObs.subscribe({
            next: (pool) => {
                this.notificationService.success("Pool resize started!",
                    `Pool '${this.pool.id}' will resize to ${pool.targetNodes} nodes!`);
            },
            error: () => null,
        });

        return finalObs;
    }

    private _enableAutoScale(value: PoolScaleSelection) {
        const dto = new PoolEnableAutoScaleDto({
            autoScaleFormula: value.autoScaleFormula,
            autoScaleEvaluationInterval: moment.duration(value.autoScaleEvaluationInterval, "minutes") as any,
        });

        return this.poolService.enableAutoScale(this.pool.id, dto);
    }

    private _resizeToFixed(value: PoolScaleSelection) {
        const targetDedicatedNodes = value.targetDedicatedNodes;
        const targetLowPriorityNodes = value.targetLowPriorityNodes;
        return this._disableAutoScale().pipe(
            switchMap(() => this.poolService.resize(this.pool.id, new PoolResizeDto({
                nodeDeallocationOption: this.taskAction.value.nodeDeallocationOption,
                resizeTimeout: value.resizeTimeout,
                targetDedicatedNodes: targetDedicatedNodes,
                targetLowPriorityNodes: targetLowPriorityNodes,
            }))),
        );
    }

    private _disableAutoScale() {
        if (this.pool.enableAutoScale) {
            return this.poolService.disableAutoScale(this.pool.id).pipe(
                switchMap(() => this._waitForAutoscaleDisabled()),
            );
        } else {
            return of({});
        }
    }

    private _waitForAutoscaleDisabled() {
        return interval(1000).pipe(
            switchMap(() => this.poolService.get(this.pool.id)),
            filter((pool) => pool.enableAutoScale === false && pool.allocationState !== PoolAllocationState.resizing),
            take(1),
            timeoutWith(60000, throwError(new ServerError({
                code: "TIMEOUT",
                status: 408,
                message: "Waiting for autoscale disable timeout. Try again later",
            }))),
        );
    }
}
