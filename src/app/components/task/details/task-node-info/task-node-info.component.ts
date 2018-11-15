import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnChanges, OnDestroy } from "@angular/core";
import { ComputeNodeInformation } from "app/models";
import { NodeService, PoolService } from "app/services";
import { BehaviorSubject, Subject } from "rxjs";
import { distinctUntilChanged, filter, switchMap, takeUntil } from "rxjs/operators";

import { I18nService, isNotNullOrUndefined } from "@batch-flask/core";
import "./task-node-info.scss";

enum EntityStatus {
    Loading,
    Exist,
    NotFound,
}
@Component({
    selector: "bl-task-node-info",
    templateUrl: "task-node-info.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TaskNodeInfoComponent implements OnChanges, OnDestroy {
    public EntityStatus = EntityStatus;

    @Input() public nodeInfo: ComputeNodeInformation;

    public poolStatus: EntityStatus = EntityStatus.Loading;
    public nodeStatus: EntityStatus = EntityStatus.Loading;
    public poolDescription: string | undefined;
    public nodeDescription: string | undefined;

    private _nodeInfo = new BehaviorSubject<ComputeNodeInformation | null>(null);
    private _destroy = new Subject();

    constructor(
        private changeDetector: ChangeDetectorRef,
        private i18n: I18nService,
        private poolService: PoolService,
        private nodeService: NodeService) {

        this._nodeInfo.pipe(
            takeUntil(this._destroy),
            filter(isNotNullOrUndefined),
            filter((nodeInfo) => nodeInfo.poolId != null),
            distinctUntilChanged((a, b) => a.poolId === b.poolId),
            switchMap((nodeInfo) => this.poolService.exist({ id: nodeInfo.poolId })),
        ).subscribe((exist) => {
            this.poolStatus = exist ? EntityStatus.Exist : EntityStatus.NotFound;

            this.poolDescription = this.i18n.t(exist ? "task-node-info.navigateToPool" : "task-node-info.poolNotFound");
            this.changeDetector.markForCheck();
        });

        this._nodeInfo.pipe(
            takeUntil(this._destroy),
            filter(isNotNullOrUndefined),
            filter((nodeInfo) => nodeInfo.poolId != null && nodeInfo.nodeId != null),
            switchMap((nodeInfo) => this.nodeService.exist({ id: nodeInfo.nodeId, poolId: nodeInfo.poolId })),
        ).subscribe((exist) => {
            this.nodeStatus = exist ? EntityStatus.Exist : EntityStatus.NotFound;
            this.nodeDescription = this.i18n.t(exist ? "task-node-info.navigateToNode" : "task-node-info.nodeNotFound");
            this.changeDetector.markForCheck();
        });
    }

    public ngOnChanges(changes) {
        if (changes.nodeInfo) {
            this._nodeInfo.next(this.nodeInfo);
        }
    }

    public ngOnDestroy() {
        this._destroy.next();
        this._destroy.complete();
    }

}
