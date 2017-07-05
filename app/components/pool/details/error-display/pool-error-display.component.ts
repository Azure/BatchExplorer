import { ChangeDetectionStrategy, Component, Input } from "@angular/core";
import { autobind } from "core-decorators";
import { shell } from "electron";

import { Pool, ResizeErrorCode } from "app/models";
import { PoolResizeDto } from "app/models/dtos";
import { AccountService, PoolService } from "app/services";
import { ExternalLinks } from "app/utils/constants";

@Component({
    selector: "bl-pool-error-display",
    templateUrl: "pool-error-display.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PoolErrorDisplayComponent {
    public ResizeErrorCode = ResizeErrorCode;

    @Input()
    public pool: Pool;

    constructor(private poolService: PoolService, private accountService: AccountService) {
    }

    public get dedicatedQuota() {
        return this.accountService.currentAccount.map(x => x.properties.dedicatedCoreQuota);
    }

    public get lowPriorityQuota() {
        return this.accountService.currentAccount.map(x => x.properties.lowPriorityCoreQuota);
    }

    @autobind()
    public fixStopResizeError() {
        const obs = this.poolService.resize(this.pool.id, new PoolResizeDto({
            targetDedicatedNodes: this.pool.targetDedicatedNodes,
            targetLowPriorityNodes: this.pool.targetLowPriorityNodes,
        }));
        obs.subscribe(() => {
            this.refreshPool();
        });

        return obs;
    }

    public increaseQuota() {
        shell.openExternal(ExternalLinks.supportRequest);
    }

    public refreshPool() {
        return this.poolService.getOnce(this.pool.id);
    }
}
