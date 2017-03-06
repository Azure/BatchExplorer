import { Component, Input, ViewChild } from "@angular/core";
import { List } from "immutable";

import { LoadingStatus } from "app/components/base/loading";
import { QuickListComponent } from "app/components/base/quick-list";
import { ListOrTableBase } from "app/components/base/selectable-list";
import { TableComponent } from "app/components/base/table";
import { Node } from "app/models";

@Component({
    selector: "bl-node-list-display",
    templateUrl: "node-list-display.html",
})
export class NodeListDisplayComponent  extends ListOrTableBase  {
    @Input()
    public quickList: boolean;

    @Input()
    public poolId: string;

    /**
     * If set to true it will display the quick list view, if false will use the table view
     */
    @Input()
    public nodes: List<Node>;

    @Input()
    public status: LoadingStatus;

    @ViewChild(QuickListComponent)
    public list: QuickListComponent;

    @ViewChild(TableComponent)
    public table: TableComponent;

    public isErrorState(node: any) {
        if (node.state === "startTaskFailed") {
            return true;
        }
        return false;
    }
}
