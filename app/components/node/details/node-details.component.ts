import { Component, OnDestroy, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { autobind } from "core-decorators";
import { Subscription } from "rxjs";

import { SidebarManager } from "app/components/base/sidebar";
import { Node, Pool } from "app/models";
import { FileService, NodeParams, NodeService, PoolService } from "app/services";
import { RxEntityProxy } from "app/services/core";
import { NodeConnectComponent } from "../connect";

@Component({
    selector: "bex-node-details",
    templateUrl: "node-details.html",
})
export class NodeDetailsComponent implements OnInit, OnDestroy {
    public static breadcrumb({id}, {tab}) {
        let label = tab ? `Node - ${tab}` : "Node";
        return {
            name: id,
            label,
        };
    }

    public nodeId: string;
    public poolId: string;
    public data: RxEntityProxy<NodeParams, Node>;
    public poolData: RxEntityProxy<NodeParams, Pool>;
    public node: Node;
    public pool: Pool;

    private _paramsSubscribers: Subscription[] = [];

    constructor(
        private route: ActivatedRoute,
        private nodeService: NodeService,
        private poolService: PoolService,
        private fileService: FileService,
        private sidebarManager: SidebarManager) {

        this.data = nodeService.get(null, null, {});
        this.data.item.subscribe((node) => {
            if (node) {
                // this.decorator = new NodeDecorator(node);
                this.node = node;
            }
        });

        this.poolData = this.poolService.get(null, {});
        this.poolData.item.subscribe((pool) => {
            if (pool) {
                this.pool = pool;
            }
        });
    }

    public ngOnInit() {
        this._paramsSubscribers.push(this.route.params.subscribe((params) => {
            this.nodeId = params["id"];
            this.update();
        }));

        this._paramsSubscribers.push(this.route.parent.params.subscribe((params) => {
            this.poolId = params["poolId"];
            this.update();
        }));
    }

    public update() {
        if (this.nodeId && this.poolId) {
            this.data.params = { id: this.nodeId, poolId: this.poolId };
            this.data.fetch();
            this.poolData.params = { id: this.poolId };
            this.poolData.fetch();
        }
    }

    public ngOnDestroy() {
        this._paramsSubscribers.forEach(x => x.unsubscribe());
    }

    @autobind()
    public refresh() {
        return this.data.refresh();
    }

    public connect() {
        const ref = this.sidebarManager.open(`connect-node-${this.nodeId}`, NodeConnectComponent);
        ref.component.node = this.node;
        ref.component.pool = this.pool;
    }
}
