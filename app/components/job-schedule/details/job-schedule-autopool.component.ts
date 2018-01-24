import { ChangeDetectionStrategy, Component, Input, OnChanges } from "@angular/core";

import { PoolConfigurationComponent } from "app/components/pool/details";
import { Pool } from "app/models";

// tslint:disable:trackBy-function
@Component({
    selector: "bl-job-schedule-autopool",
    templateUrl: "job-schedule-autopool.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JobScheduleAutoPoolComponent extends PoolConfigurationComponent implements OnChanges {
    @Input() public properties: any;

    public ngOnChanges(changes) {
        if (changes.properties) {
            this.pool = new Pool(this.properties.pool);
        }
    }
}
