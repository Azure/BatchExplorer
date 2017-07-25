import { Component, OnDestroy, OnInit } from "@angular/core";
import { MdDialog, MdDialogConfig } from "@angular/material";
import { ActivatedRoute } from "@angular/router";
import { autobind } from "core-decorators";
import { Subscription } from "rxjs";

import { DialogService } from "app/components/base/dialogs";
import { SidebarManager } from "app/components/base/sidebar";
import { SimpleDialogComponent } from "app/components/base/simple-dialog";
import { Node, Pool } from "app/models";
import { FileService, NodeParams, NodeService, PoolService } from "app/services";
import { RxEntityProxy } from "app/services/core";
import { NodeConnectComponent } from "../connect";

@Component({
    selector: "bl-node-details",
    templateUrl: "node-details.html",
})
export class NodeDetailsComponent implements OnInit, OnDestroy {
    public static breadcrumb({ id }, { tab }) {
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
        private dialog: DialogService,
        fileService: FileService,
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
        this.poolData.dispose();
        this.data.dispose();
    }

    @autobind()
    public refresh() {
        return this.data.refresh();
    }

    @autobind()
    public connect() {
        const ref = this.sidebarManager.open(`connect-node-${this.nodeId}`, NodeConnectComponent);
        ref.component.node = this.node;
        ref.component.pool = this.pool;
    }

    @autobind()
    public delete() {
        this.dialog.confirm("Are you sure you want to delete this node?", {
            yes: () => {
                return this.nodeService.delete(this.pool.id, this.nodeId)
                    .cascade(() => this.nodeService.getOnce(this.pool.id, this.node.id));
            },
        });
    }
}
