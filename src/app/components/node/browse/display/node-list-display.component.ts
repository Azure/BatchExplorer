import { Component, EventEmitter, Injector, Input, Output, ViewChild } from "@angular/core";
import {
    EntityCommands, ListBaseComponent, LoadingStatus, QuickListComponent, TableComponent,
} from "@batch-flask/ui";
import { Node } from "app/models";
import { List } from "immutable";

import "./node-list-display.scss";

@Component({
    selector: "bl-node-list-display",
    templateUrl: "node-list-display.html",
})
export class NodeListDisplayComponent extends ListBaseComponent {
    @Input() public poolId: string;

    /**
     * If set to true it will display the quick list view, if false will use the table view
     */
    @Input() public nodes: List<Node>;

    @Input() public status: LoadingStatus;

    @Input() public commands: EntityCommands<any>;

    @Output() public scrollBottom = new EventEmitter();

    @ViewChild(QuickListComponent)
    public list: QuickListComponent;

    @ViewChild(TableComponent)
    public table: TableComponent;

    constructor(injector: Injector) {
        super(injector);
    }

    public isErrorState(node: any) {
        if (node.state === "startTaskFailed") {
            return true;
        }
        return false;
    }
}
