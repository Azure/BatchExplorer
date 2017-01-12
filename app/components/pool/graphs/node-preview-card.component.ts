import { Component, EventEmitter, Input, Output } from "@angular/core";

import { Node } from "app/models";

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
}
