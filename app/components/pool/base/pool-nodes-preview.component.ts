import { Component, HostBinding, Input, OnChanges } from "@angular/core";

import { Pool, PoolAllocationState } from "app/models";

import "./pool-nodes-preview.scss";

@Component({
    selector: "bl-pool-nodes-preview",
    templateUrl: "pool-nodes-preview.html",
})
export class PoolNodesPreviewComponent implements OnChanges {
    @Input()
    public pool: Pool;

    @Input()
    public tooltipPosition: string = "below";

    @Input()
    @HostBinding("class")
    public size: ComponentSize = "normal";
    public tooltipMessage: string;

    @HostBinding("class.resize-error")
    public hasResizeError: boolean = false;
    public ngOnChanges(inputs) {
        if (inputs.pool) {
            this.tooltipMessage = this._getTooltipMessage();
            this.hasResizeError = this.pool.resizeErrors.size > 0;
        }
    }

    private _getTooltipMessage() {
        const pool = this.pool;
        if (this.hasResizeError) {
            return "There was a resize error";
        } else if (pool.allocationState === PoolAllocationState.resizing) {
            return `Pool is resizing from ${pool.currentNodes} to ${pool.targetNodes} nodes`;
        } else {
            return `Pool has ${pool.currentNodes} nodes`;
        }
    }
}
