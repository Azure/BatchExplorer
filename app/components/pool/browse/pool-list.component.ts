import {
    ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, forwardRef,
} from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { Filter, ListView, autobind } from "@batch-flask/core";
import { ListBaseComponent, ListSelection } from "@batch-flask/core/list";
import { LoadingStatus } from "@batch-flask/ui/loading";
import { QuickListItemStatus } from "@batch-flask/ui/quick-list";
import { TableConfig } from "@batch-flask/ui/table";
import { Pool } from "app/models";
import { PoolListParams, PoolService } from "app/services";
import { ComponentUtils } from "app/utils";
import { List } from "immutable";
import { Observable, Subscription, of } from "rxjs";
import { PoolCommands } from "../action";

import { Activity, ActivityService } from "@batch-flask/ui/activity-monitor";
import { flatMap, map } from "rxjs/operators";
import { WaitForDeletePoller } from "../../core/pollers";
import "./pool-list.scss";

@Component({
    selector: "bl-pool-list",
    templateUrl: "pool-list.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [PoolCommands, {
        provide: ListBaseComponent,
        useExisting: forwardRef(() => PoolListComponent),
    }],
})
export class PoolListComponent extends ListBaseComponent implements OnInit, OnDestroy {
    public LoadingStatus = LoadingStatus;
    public data: ListView<Pool, PoolListParams>;

    public tableConfig: TableConfig = {
        showCheckbox: true,
    };

    public pools: List<Pool> = List([]);
    private _subs: Subscription[] = [];

    constructor(
        private poolService: PoolService,
        activatedRoute: ActivatedRoute,
        router: Router,
        public commands: PoolCommands,
        changeDetector: ChangeDetectorRef,
        private activityService: ActivityService) {
        super(changeDetector);
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

    public handleFilter(filter: Filter) {
        if (filter.isEmpty()) {
            this.data.setOptions({});
        } else {
            this.data.setOptions({ filter: filter });
        }

        this.data.fetchNext();
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
        const selectionArr = Array.from(selection.keys);

        const initializer = () => {
            return of(selectionArr).pipe(
                map(poolIDs => {
                    // map each selected job id to a job deletion activity
                    return poolIDs.map(id => {
                        const name = `Deleting Pool '${id}'`;
                        const activity = new Activity(name, () => {
                            return this.poolService.delete(id).pipe(
                                flatMap(obs => {
                                    const poller = new WaitForDeletePoller(() => {
                                        return this.poolService.get(id);
                                    });
                                    return poller.start();
                                }),
                            );
                        });
                        activity.done.subscribe(() => this.refresh());
                        return activity;
                    });
                }),
            );
        };

        let mainName = `Deleting ${selectionArr.length} Pool`;
        if (selectionArr.length > 1) {
            mainName += "s";
        }
        const deleteActivity = new Activity(mainName, initializer);
        this.activityService.loadAndRun(deleteActivity);
        deleteActivity.done.subscribe(() => this.refresh());
        return deleteActivity.done;
    }

    public trackById(index, pool) {
        return pool.id;
    }
}
