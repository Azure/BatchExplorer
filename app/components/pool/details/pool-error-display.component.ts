import { ChangeDetectionStrategy, Component, Input } from "@angular/core";
import { autobind } from "core-decorators";
import { shell } from "electron";

import { Pool, ResizeErrorCode } from "app/models";
import { AccountService, PoolService } from "app/services";
import { ExternalLinks } from "app/utils/constants";

@Component({
    selector: "bex-pool-error-display",
    templateUrl: "pool-error-display.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PoolErrorDisplayComponent {
    @Input()
    public pool: Pool;

    constructor(private poolService: PoolService, private accountService: AccountService) {

    }

    public get hasResizeError(): boolean {
        return Boolean(this.pool && this.pool.resizeError);
    }

    public get hasQuotaReachedError(): boolean {
        return this.hasResizeError && Boolean(this.pool.resizeError.code === ResizeErrorCode.accountCoreQuotaReached);
    }

    public get quota() {
        return this.accountService.currentAccount.map(x => x.properties.coreQuota);
    }

    @autobind()
    public fixStopResizeError() {
        const obs = this.poolService.resize(this.pool.id, this.pool.targetDedicated);
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
