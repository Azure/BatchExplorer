import { ChangeDetectorRef, Component, Input, OnDestroy, OnInit, forwardRef } from "@angular/core";
import { Observable } from "rxjs";

import { ActivatedRoute } from "@angular/router";
import { Filter, autobind } from "@batch-flask/core";
import { ListBaseComponent } from "@batch-flask/core/list";
import { LoadingStatus } from "@batch-flask/ui/loading";
import { Node } from "app/models";
import { NodeListParams, NodeService } from "app/services";
import { ListView } from "app/services/core";
import { ComponentUtils } from "app/utils";

@Component({
    selector: "bl-node-list",
    templateUrl: "node-list.html",
    providers: [{
        provide: ListBaseComponent,
        useExisting: forwardRef(() => NodeListComponent),
    }],
})
export class NodeListComponent extends ListBaseComponent implements OnInit, OnDestroy {
    public LoadingStatus = LoadingStatus;

    @Input() public manualLoading: boolean;

    @Input() public set poolId(value: string) {
        this._poolId = (value && value.trim());
        this.refresh();
    }
    public get poolId() { return this._poolId; }

    public data: ListView<Node, NodeListParams>;

    private _poolId: string;

    constructor(private nodeService: NodeService, activatedRoute: ActivatedRoute, changeDetector: ChangeDetectorRef) {
        super(changeDetector);
        this.data = this.nodeService.listView();

        this.data.status.subscribe((status) => {
            this.status = status;
        });
        ComponentUtils.setActiveItem(activatedRoute, this.data);
    }

    public ngOnInit() {
        this.data.fetchNext();
    }

    public ngOnDestroy() {
        this.data.dispose();
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
