import { ChangeDetectorRef, Component, Input, OnDestroy, OnInit, forwardRef } from "@angular/core";
import { Observable } from "rxjs";

import { ActivatedRoute } from "@angular/router";
import { Filter, autobind } from "@batch-flask/core";
import { ListBaseComponent } from "@batch-flask/core/list";
import { LoadingStatus } from "@batch-flask/ui/loading";
import { Node, Pool } from "app/models";
import { NodeListParams, NodeService, PoolParams, PoolService } from "app/services";
import { EntityView, ListView } from "@batch-flask/core";
import { ComponentUtils } from "app/utils";
import { NodeCommands } from "../action";

@Component({
    selector: "bl-node-list",
    templateUrl: "node-list.html",
    providers: [NodeCommands, {
        provide: ListBaseComponent,
        useExisting: forwardRef(() => NodeListComponent),
    }],
})
export class NodeListComponent extends ListBaseComponent implements OnInit, OnDestroy {
    public LoadingStatus = LoadingStatus;

    @Input() public set poolId(value: string) {
        this._poolId = (value && value.trim());
        this.refresh();
    }
    public get poolId() { return this._poolId; }

    public data: ListView<Node, NodeListParams>;
    public poolData: EntityView<Pool, PoolParams>;

    private _poolId: string;

    constructor(public commands: NodeCommands,
                private nodeService: NodeService,
                private poolService: PoolService,
                activatedRoute: ActivatedRoute,
                changeDetector: ChangeDetectorRef) {
        super(changeDetector);
        this.data = this.nodeService.listView();

        this.data.status.subscribe((status) => {
            this.status = status;
        });
        ComponentUtils.setActiveItem(activatedRoute, this.data);

        this.poolData = this.poolService.view();
        this.poolData.item.subscribe((pool) => {
            if (pool) {
                this.commands.pool = pool;
                this.commands.params["poolId"] = pool.id;
            }
        });
    }

    public ngOnInit() {
        this.data.fetchNext();
        this.poolData.params = { id: this.poolId };
        this.poolData.fetch();
    }

    public ngOnDestroy() {
        this.data.dispose();
        this.poolData.dispose();
    }

    @autobind()
    public refresh(): Observable<any> {
        this.data.params = { poolId: this.poolId };
        this.data.setOptions({}); // This clears the previous list objects

        return this.data.fetchNext(true);
    }

    public handleFilter(filter: Filter) {
        if (filter.isEmpty()) {
            this.data.setOptions({});
        } else {
            this.data.setOptions({ filter });
        }

        this.data.fetchNext();
    }

    public onScrollToBottom(): Observable<any> {
        return this.data.fetchNext();
    }
}
