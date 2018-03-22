import { ChangeDetectorRef, Component, OnDestroy, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { autobind } from "@batch-flask/core";
import { Subscription } from "rxjs";

import { DialogService } from "@batch-flask/ui/dialogs";
import { SidebarManager } from "@batch-flask/ui/sidebar";
import { StartTaskEditFormComponent } from "app/components/pool/start-task";
import { Node, Pool } from "app/models";
import { FileService, NodeParams, NodeService, PoolParams, PoolService } from "app/services";
import { EntityView } from "app/services/core";
import { UploadNodeLogsDialogComponent } from "../action";
import { NodeConnectComponent } from "../connect";

import "./node-details.scss";

@Component({
    selector: "bl-node-details",
    templateUrl: "node-details.html",
})
export class NodeDetailsComponent implements OnInit, OnDestroy {
    public static breadcrumb({ id }, { tab }) {
        const label = tab ? `Node - ${tab}` : "Node";
        return {
            name: id,
            label,
            icon: "microchip",
        };
    }

    public nodeId: string;
    public poolId: string;
    public data: EntityView<Node, NodeParams>;
    public poolData: EntityView<Pool, PoolParams>;
    public node: Node;
    public pool: Pool;

    private _paramsSubscribers: Subscription[] = [];

    constructor(
        private route: ActivatedRoute,
        private nodeService: NodeService,
        private poolService: PoolService,
        private dialog: DialogService,
        fileService: FileService,
        changeDetector: ChangeDetectorRef,
        private sidebarManager: SidebarManager) {

        this.data = nodeService.view();
        this.data.item.subscribe((node) => {
            if (node) {
                // this.decorator = new NodeDecorator(node);
                this.node = node;
                changeDetector.markForCheck();
            }
        });

        this.poolData = this.poolService.view();
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
    public reboot() {
        return this.nodeService.reboot(this.pool.id, this.nodeId)
            .cascade(() => this.nodeService.get(this.pool.id, this.node.id));
    }

    @autobind()
    public delete() {
        this.dialog.confirm("Are you sure you want to delete this node?", {
            yes: () => {
                return this.nodeService.delete(this.pool.id, this.nodeId)
                    .cascade(() => this.nodeService.get(this.pool.id, this.node.id));
            },
        });
    }

    @autobind()
    public editStartTask() {
        const ref = this.sidebarManager.open(`edit-start-task-${this.pool.id}`, StartTaskEditFormComponent);
        ref.component.pool = this.pool;
        ref.component.fromNode = this.nodeId;
    }

    @autobind()
    public uploadNodeLogs() {
        const ref = this.dialog.open(UploadNodeLogsDialogComponent);
        ref.componentInstance.pool = this.pool;
        ref.componentInstance.node = this.node;
    }

}
