import { ChangeDetectionStrategy, Component, Input } from "@angular/core";
import { autobind } from "@batch-flask/core";
import { ElectronShell } from "@batch-flask/ui";
import { NameValuePair, Pool, ResizeError, ResizeErrorCode } from "app/models";
import { NodeDeallocationOption, PoolResizeDto } from "app/models/dtos";
import { BatchAccountService, PoolService } from "app/services";
import { ExternalLinks } from "common/constants";
import { map } from "rxjs/operators";

@Component({
    selector: "bl-pool-error-display",
    templateUrl: "pool-error-display.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PoolErrorDisplayComponent {
    public ResizeErrorCode = ResizeErrorCode;

    @Input() public pool: Pool;

    constructor(
        private poolService: PoolService,
        private accountService: BatchAccountService,
        private shell: ElectronShell) {
    }

    public get dedicatedQuota() {
        return this.accountService.currentAccount.pipe(map(x => x.properties.dedicatedCoreQuota));
    }

    public get lowPriorityQuota() {
        return this.accountService.currentAccount.pipe(map(x => x.properties.lowPriorityCoreQuota));
    }

    @autobind()
    public fixStopResizeError() {
        const obs = this.poolService.resize(this.pool.id, new PoolResizeDto({
            nodeDeallocationOption: NodeDeallocationOption.requeue,
            targetDedicatedNodes: this.pool.targetDedicatedNodes,
            targetLowPriorityNodes: this.pool.targetLowPriorityNodes,
        }));
        obs.subscribe(() => {
            this.refreshPool();
        });

        return obs;
    }

    public increaseQuota() {
        this.shell.openExternal(ExternalLinks.supportRequest);
    }

    public refreshPool() {
        return this.poolService.get(this.pool.id);
    }

    public trackResizeError(index, error: ResizeError) {
        return index;
    }

    public trackErrorValue(index, pair: NameValuePair) {
        return pair.name;
    }
}
