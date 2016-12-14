import { Component, OnDestroy, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { autobind } from "core-decorators";
import { Subscription } from "rxjs";

import { File } from "app/models";
import { FileService } from "app/services";
import { RxEntityProxy } from "app/services/core";

@Component({
    selector: "bex-file-details",
    templateUrl: "./file-details.html",
})
export class FileDetailsComponent implements OnInit, OnDestroy {
    // public nodeId: string;
    // public poolId: string;
    // public data: RxEntityProxy<NodeParams, Node>;
    // public node: Node;

    private _paramsSubscribers: Subscription[] = [];

    constructor(private route: ActivatedRoute, private fileService: FileService) {
        // this.data = nodeService.get(null, null, {});
        // this.data.item.subscribe((node) => {
        //     if (node) {
        //         this.decorator = new NodeDecorator(node);
        //         this.node = node;
        //     }
        // });
    }

    public ngOnInit() {
        // this._paramsSubscribers.push(this.route.params.subscribe((params) => {
        //     this.nodeId = params["id"];
        //     this.update();
        // }));

        // this._paramsSubscribers.push(this.route.parent.params.subscribe((params) => {
        //     this.poolId = params["poolId"];
        //     this.update();
        // }));
    }

    public update() {
        // if (this.nodeId && this.poolId) {
        //     this.data.params = { id: this.nodeId, poolId: this.poolId };
        //     this.data.fetch();
        // }
    }

    public ngOnDestroy() {
        this._paramsSubscribers.forEach(x => x.unsubscribe());
    }

    @autobind()
    public refreshPool() {
        // return this.data.refresh();
    }
}
