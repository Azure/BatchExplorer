import { Component, HostBinding, Input, OnChanges } from "@angular/core";

import { Pool } from "app/models";

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
            this.hasResizeError = Boolean(this.pool.resizeError);
        }
    }

    private _getTooltipMessage() {
        const pool = this.pool;
        if (pool.resizeError) {
            return "There was a resize error";
        } else if (pool.currentDedicated !== pool.targetDedicated) {
            return `Pool is resizing from ${pool.currentDedicated} to ${pool.targetDedicated} nodes`;
        } else {
            return `Pool has ${pool.currentDedicated} nodes`;
        }
    }
}
