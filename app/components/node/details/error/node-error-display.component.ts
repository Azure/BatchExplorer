import { ChangeDetectionStrategy, Component, Input } from "@angular/core";

import { Node } from "app/models";

@Component({
    selector: "bl-node-error-display",
    templateUrl: "node-error-display.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NodeErrorDisplayComponent {
    @Input()
    public node: Node;

}
