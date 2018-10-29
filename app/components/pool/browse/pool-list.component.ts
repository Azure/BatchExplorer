import { LiveAnnouncer } from "@angular/cdk/a11y";
import {
    ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, forwardRef,
} from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { Filter, ListView, autobind } from "@batch-flask/core";
import { ListSelection } from "@batch-flask/core/list";
import {
    AbstractListBaseConfig, ListBaseComponent, LoadingStatus, QuickListItemStatus, TableConfig,
} from "@batch-flask/ui";
import { Pool } from "app/models";
import { PoolListParams, PoolService } from "app/services";
import { ComponentUtils } from "app/utils";
import { List } from "immutable";
import { Observable, Subscription } from "rxjs";
import { map } from "rxjs/operators";
import { PoolCommands } from "../action";

import "./pool-list.scss";

@Component({
    selector: "bl-pool-list",
    templateUrl: "pool-list.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [
        PoolCommands, {
            provide: ListBaseComponent,
            useExisting: forwardRef(() => PoolListComponent),
        }],
})
export class PoolListComponent extends ListBaseComponent implements OnInit, OnDestroy {
    public LoadingStatus = LoadingStatus;
    public data: ListView<Pool, PoolListParams>;

    public listConfig: AbstractListBaseConfig = {
        sorting: {
            id: true,
            state: true,
            allocationState: true,
            vmSize: true,
            targetDedicatedNodes: true,
            currentDedicatedNodes: true,
            currentLowPriorityNodes: true,
            targetLowPriorityNodes: true,
        },
    };

    public tableConfig: TableConfig = {
        ...this.listConfig,
        showCheckbox: true,
    };

    public pools: List<Pool> = List([]);
    private _subs: Subscription[] = [];

    constructor(
        private poolService: PoolService,
        activatedRoute: ActivatedRoute,
        liveAnnouncer: LiveAnnouncer,
        public commands: PoolCommands,
        changeDetector: ChangeDetectorRef) {
        super(changeDetector, liveAnnouncer);
        this.data = this.poolService.listView();
        ComponentUtils.setActiveItem(activatedRoute, this.data);

        this.data.status.subscribe((status) => {
            this.status = status;
        });

        this._subs.push(poolService.onPoolAdded.subscribe((poolId) => {
            this.data.loadNewItem(poolService.get(poolId));
        }));
        this._subs.push(this.data.items.subscribe((pools) => {
            this.pools = pools;
            this.changeDetector.markForCheck();
        }));
    }

    public ngOnInit() {
        this.data.fetchNext();
    }

    public ngOnDestroy() {
        this._subs.forEach(x => x.unsubscribe());
        this.data.dispose();
    }

    @autobind()
    public refresh(): Observable<any> {
        return this.data.refresh();
    }

    public handleFilter(filter: Filter): Observable<number> {
        if (filter.isEmpty()) {
            this.data.setOptions({});
        } else {
            this.data.setOptions({ filter: filter });
        }

        return this.data.fetchNext().pipe(map(x => x.items.size));
    }

    public poolStatus(pool: Pool): QuickListItemStatus {
        return pool.resizeErrors.size > 0 ? QuickListItemStatus.warning : null;
    }

    public poolStatusText(pool: Pool): string {
        if (pool.resizeErrors.size > 0) {
            return "Pool has a resize error";
        }

        return "";
    }

    public onScrollToBottom() {
        this.data.fetchNext();
    }

    public deleteSelection(selection: ListSelection) {
        this.commands.delete.executeFromSelection(selection).subscribe();
    }
}
