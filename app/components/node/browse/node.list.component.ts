import { Component, Input, OnInit, ViewChild } from "@angular/core";
import { autobind } from "core-decorators";
import { Observable } from "rxjs";

import { NodeListDisplayComponent } from "./display";
import { LoadingStatus } from "app/components/base/loading";
import { SelectableList } from "app/components/base/selectable-list";
import { Node } from "app/models";
import { NodeListParams, NodeService } from "app/services";
import { RxListProxy } from "app/services/core";
import { Filter } from "app/utils/filter-builder";

@Component({
    selector: "bex-node-list",
    templateUrl: "node-list.html",
})
export class NodeListComponent extends SelectableList implements OnInit {
    /**
     * If set to true it will display the quick list view, if false will use the table view
     */
    @Input()
    public quickList: boolean;

    @Input()
    public manualLoading: boolean;

    @Input()
    public set poolId(value: string) {
        this._poolId = (value && value.trim());
        this.refresh();
    }
    public get poolId() { return this._poolId; }

    @Input()
    public set filter(filter: Filter) {
        this._filter = filter;

        if (filter.isEmpty()) {
            this.data.setOptions({});
        } else {
            this.data.setOptions({ filter: filter.toOData() });
        }

        this.data.fetchNext();
    }
    public get filter(): Filter { return this._filter; };

    @ViewChild(NodeListDisplayComponent)
    public list: NodeListDisplayComponent;

    public status: Observable<LoadingStatus>;
    public data: RxListProxy<NodeListParams, Node>;

    private _filter: Filter;
    private _poolId: string;

    constructor(private nodeService: NodeService) {
        super();
    }

    public ngOnInit() {
        return;
    }

    @autobind()
    public refresh(): Observable<any> {
        this.data = this.nodeService.list(this.poolId);
        this.status = this.data.status;
        this.data.setOptions({}); // This clears the previous list objects
        return this.data.fetchNext(true);
    }

    public onScrollToBottom(x) {
        this.data.fetchNext();
    }
}
