import {
    ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, forwardRef,
} from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { List } from "immutable";
import { Observable, Subscription } from "rxjs";

import { Filter, autobind } from "@batch-flask/core";
import { ListBaseComponent, ListSelection } from "@batch-flask/core/list";
import { BackgroundTaskService } from "@batch-flask/ui/background-task";
import { LoadingStatus } from "@batch-flask/ui/loading";
import { QuickListItemStatus } from "@batch-flask/ui/quick-list";
import { TableConfig } from "@batch-flask/ui/table";
import { Pool } from "app/models";
import { PoolDecorator } from "app/models/decorators";
import { PoolListParams, PoolService } from "app/services";
import { ListView } from "app/services/core";
import { ComponentUtils } from "app/utils";
import { DeletePoolTask, PoolCommands } from "../action";

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

    public pools: List<PoolDecorator> = List([]);
    private _subs: Subscription[] = [];

    constructor(
        private poolService: PoolService,
        activatedRoute: ActivatedRoute,
        router: Router,
        public commands: PoolCommands,
        changeDetector: ChangeDetectorRef,
        private taskManager: BackgroundTaskService) {
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
            this.pools = List<PoolDecorator>(pools.map(x => new PoolDecorator(x)));
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
        this.taskManager.startTask("", (backgroundTask) => {
            const task = new DeletePoolTask(this.poolService, [...this.selection.keys]);
            task.start(backgroundTask);
            return task.waitingDone;
        });
    }

    public trackById(index, pool) {
        return pool.id;
    }
}
