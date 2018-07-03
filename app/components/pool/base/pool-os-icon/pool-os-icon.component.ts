import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnChanges } from "@angular/core";
import { OSType, Pool } from "app/models";

import "./pool-os-icon.scss";

@Component({
    selector: "bl-pool-os-icon",
    templateUrl: "pool-os-icon.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PoolOsIconComponent implements OnChanges {
    @Input() public pool: Pool;
    @Input() public tooltipPosition: string = "right";

    public icon: string;

    constructor(private changeDetector: ChangeDetectorRef) {

    }

    public ngOnChanges(inputs) {
        if (inputs.pool) {
            this.icon = this._computeIcon();
        }
    }

    private _computeIcon() {
        if (this.pool.osType === OSType.Windows) {
            return "fa-windows";
        } else if (this.pool.osType === OSType.Linux)  {
            return "fa-linux";
        } else {
            return "fa-cloud";
        }
    }
}
