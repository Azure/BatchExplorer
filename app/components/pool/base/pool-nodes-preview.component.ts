import { Component, Input } from "@angular/core";

import { Pool } from "app/models";

@Component({
    selector: "bl-pool-nodes-preview",
    templateUrl: "pool-nodes-preview.html",
})
export class PoolNodesPreviewComponent {
    @Input()
    public pool: Pool;

    @Input()
    public tooltipPosition: string = "below";

    @Input()
    public largeIcon: boolean = false;

    public get tooltipMessage() {
        if (this.pool.resizeError) {
            return "There was a resize error";
        } else if (this.pool.currentDedicated !== this.pool.targetDedicated) {
            return `Pool is resizing from ${this.pool.currentDedicated} to ${this.pool.targetDedicated} nodes`;
        } else {
            return `Pool has ${this.pool.currentDedicated} nodes`;
        }
    }
}
