import { ChangeDetectorRef, Component, Input, OnInit, forwardRef } from "@angular/core";
import { autobind } from "app/core";
import { Observable } from "rxjs";

import { ActivatedRoute } from "@angular/router";
import { LoadingStatus } from "app/components/base/loading";
import { ListBaseComponent } from "app/core/list";
import { Node } from "app/models";
import { NodeListParams, NodeService } from "app/services";
import { ListView } from "app/services/core";
import { ComponentUtils } from "app/utils";
import { Filter } from "app/utils/filter-builder";

@Component({
    selector: "bl-node-list",
    templateUrl: "node-list.html",
    providers: [{
        provide: ListBaseComponent,
        useExisting: forwardRef(() => NodeListComponent),
    }],
})
export class NodeListComponent extends ListBaseComponent implements OnInit {
    public LoadingStatus = LoadingStatus;

    @Input() public manualLoading: boolean;

    @Input() public set poolId(value: string) {
        this._poolId = (value && value.trim());
        this.refresh();
    }
    public get poolId() { return this._poolId; }

    public status: Observable<LoadingStatus>;
    public data: ListView<Node, NodeListParams>;

    private _poolId: string;

    constructor(private nodeService: NodeService, activatedRoute: ActivatedRoute, changeDetector: ChangeDetectorRef) {
        super(changeDetector);
        this.data = this.nodeService.listView();
        ComponentUtils.setActiveItem(activatedRoute, this.data);
    }

    public ngOnInit() {
        this.data.fetchNext();
    }

    @autobind()
    public refresh(): Observable<any> {
        this.data.params = { poolId: this.poolId };
        this.status = this.data.status;
        this.data.setOptions({}); // This clears the previous list objects

        return this.data.fetchNext(true);
    }

    public handleFilter(filter: Filter) {
        if (filter.isEmpty()) {
            this.data.setOptions({});
        } else {
            this.data.setOptions({ filter: filter.toOData() });
        }

        this.data.fetchNext();
    }

    @autobind()
    public loadMore(): Observable<any> {
        return this.data.fetchNext();
    }
}
