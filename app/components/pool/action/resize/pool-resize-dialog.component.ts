import { Component, Input } from "@angular/core";
import { FormBuilder, FormControl, FormGroup } from "@angular/forms";
import { autobind } from "@batch-flask/core";
import * as moment from "moment";
import { Observable } from "rxjs";

import { NotificationService } from "@batch-flask/ui/notifications";
import { SidebarRef } from "@batch-flask/ui/sidebar";
import { Pool } from "app/models";
import { PoolEnableAutoScaleDto, PoolResizeDto } from "app/models/dtos";
import { NodeDeallocationOption, PoolScaleModel } from "app/models/forms";
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
            nodeDeallocationOption: NodeDeallocationOption.Requeue.toString(),
        });

        this.form = this.formBuilder.group({
            scale: this.scale,
            nodeDeallocationOption: this.taskAction,
        });
    }

    @autobind()
    public submit() {
        const id = this.pool.id;
        const value: PoolScaleModel = this.scale.value;
        console.log("rescale scale value: ", value);
        console.log("nodeDeallocationOption value: ", this.taskAction.value);
        // let obs;
        // if (value.enableAutoScale) {
        //     obs = this._enableAutoScale(value);
        // } else {
        //     const targetDedicatedNodes = value.targetDedicatedNodes;
        //     const targetLowPriorityNodes = value.targetLowPriorityNodes;
        //     obs = this._disableAutoScale()
        //         .flatMap(() => this.poolService.resize(id, new PoolResizeDto({
        //             targetDedicatedNodes, targetLowPriorityNodes,
        //         })));
        // }

        // const finalObs = obs.flatMap(() => this.poolService.get(this.pool.id)).share();
        // finalObs.subscribe({
        //     next: (pool) => {
        //         this.notificationService.success("Pool resize started!",
        //             `Pool '${id}' will resize to ${pool.targetNodes} nodes!`);
        //     },
        //     error: () => null,
        // });

        // return finalObs;
        return Observable.of(true);
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
