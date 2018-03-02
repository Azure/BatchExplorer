import { ChangeDetectorRef, Component, EventEmitter, Input, Output, ViewChild } from "@angular/core";
import { List } from "immutable";

import { ListBaseComponent } from "@bl-common/core/list";
import { LoadingStatus } from "@bl-common/ui/loading";
import { QuickListComponent } from "@bl-common/ui/quick-list";
import { TableComponent } from "@bl-common/ui/table";
import { Node } from "app/models";

@Component({
    selector: "bl-node-list-display",
    templateUrl: "node-list-display.html",
})
export class NodeListDisplayComponent extends ListBaseComponent {
    @Input()
    public poolId: string;

    /**
     * If set to true it will display the quick list view, if false will use the table view
     */
    @Input()
    public nodes: List<Node>;

    @Input()
    public status: LoadingStatus;

    @Output() public scrollBottom = new EventEmitter();

    @ViewChild(QuickListComponent)
    public list: QuickListComponent;

    @ViewChild(TableComponent)
    public table: TableComponent;

    constructor(changeDetector: ChangeDetectorRef) {
        super(changeDetector);
    }

    public isErrorState(node: any) {
        if (node.state === "startTaskFailed") {
            return true;
        }
        return false;
    }

    public trackNode(index, node: Node) {
        return node.id;
    }
}
