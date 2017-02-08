import { Component, OnDestroy, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { autobind } from "core-decorators";
import { Subscription } from "rxjs";

import { Node } from "app/models";
import { FileService, NodeParams, NodeService } from "app/services";
import { RxEntityProxy } from "app/services/core";

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
    public node: Node;

    private _paramsSubscribers: Subscription[] = [];

    constructor(private route: ActivatedRoute, private nodeService: NodeService, private fileService: FileService) {
        this.data = nodeService.get(null, null, {});
        this.data.item.subscribe((node) => {
            if (node) {
                // this.decorator = new NodeDecorator(node);
                this.node = node;
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

    public get filterPlaceholderText() {
        return "Filter by file name";
    }

    public update() {
        if (this.nodeId && this.poolId) {
            this.data.params = { id: this.nodeId, poolId: this.poolId };
            this.data.fetch();
        }
    }

    public ngOnDestroy() {
        this._paramsSubscribers.forEach(x => x.unsubscribe());
    }

    @autobind()
    public refreshPool() {
        // return this.data.refresh();
    }
}
