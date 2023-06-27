import { ChangeDetectionStrategy, Component, Input } from "@angular/core";
import { ComputeNodeError, NameValuePair, Node } from "app/models";

@Component({
    selector: "bl-node-error-display",
    templateUrl: "node-error-display.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NodeErrorDisplayComponent {
    @Input() public node: Node;

    public trackError(index, error: ComputeNodeError) {
        return index;
    }

    public trackErrorDetail(index, detail: NameValuePair) {
        return detail.name;
    }
}
