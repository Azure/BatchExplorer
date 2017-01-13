import { Component, EventEmitter, Input, Output } from "@angular/core";
import { autobind } from "core-decorators";

import { Node } from "app/models";
import { NodeService } from "app/services";

@Component({
    selector: "bex-node-preview-card",
    templateUrl: "node-preview-card.html",
})
export class NodePreviewCardComponent {
    @Input()
    public node: Node;

    @Input()
    public poolId: string;

    @Output()
    public close = new EventEmitter();

    constructor(private nodeService: NodeService) {

    }

    @autobind()
    public reboot() {
        return this.nodeService.reboot(this.poolId, this.node.id);
    }

    @autobind()
    public reimage() {
        return this.nodeService.reimage(this.poolId, this.node.id);
    }
}
