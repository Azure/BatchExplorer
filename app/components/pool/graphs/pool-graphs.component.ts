import { Component, Input, OnChanges, OnDestroy } from "@angular/core";
import { List } from "immutable";

import { Node } from "app/models";
import { NodeListParams, NodeService } from "app/services";
import { RxListProxy } from "app/services/core";

const refreshRate = 5000;
@Component({
    selector: "bex-pool-graphs",
    templateUrl: "pool-graphs.html",
})
export class PoolGraphsComponent implements OnChanges, OnDestroy {
    @Input()
    public poolId: string;

    public data: RxListProxy<NodeListParams, Node>;

    public nodes: List<Node> = List([]);

    private _refreshInterval: any;

    constructor(nodeService: NodeService) {
        this.data = nodeService.list(null, {
            maxResults: 1000,
            select: "id,state",
        });
        this.data.items.subscribe((nodes) => {
            if (nodes.size !== 0) {
                this.nodes = nodes;
            }
        });

        this._refreshInterval = setInterval(() => {
            this.data.refresh(false);
        }, refreshRate);
    }

    public ngOnChanges(changes) {
        if (changes.poolId) {
            this.data.updateParams({ poolId: changes.poolId.currentValue });
            this.data.fetchNext();
        }
    }

    public ngOnDestroy() {
        clearInterval(this._refreshInterval);
    }
}
