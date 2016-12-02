import { Component, Input, OnInit } from "@angular/core";
import { autobind } from "core-decorators";
import { Observable } from "rxjs";

import { LoadingStatus } from "app/components/base/loading";
import { File } from "app/models";
import { FileService, NodeFileListParams } from "app/services";
import { RxListProxy } from "app/services/core";
import { Filter } from "app/utils/filter-builder";

@Component({
    selector: "bex-file-list",
    template: require("./file-list.html"),
})
export class FileListComponent implements OnInit {
    /**
     * If set to true it will display the quick list view, if false will use the table view
     */
    @Input()
    public quickList: boolean;

    @Input()
    public set poolId(value: string) {
        this._poolId = (value && value.trim());
        this.refresh();
    }
    public get poolId() { return this._poolId; }

    @Input()
    public set nodeId(value: string) {
        this._nodeId = (value && value.trim());
        this.refresh();
    }
    public get nodeId() { return this._nodeId; }

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

    public status: Observable<LoadingStatus>;
    public data: RxListProxy<NodeFileListParams, File>;

    private _filter: Filter;
    private _poolId: string;
    private _nodeId: string;

    constructor(private fileService: FileService) {
    }

    public ngOnInit() {
        return;
    }

    @autobind()
    public refresh(): Observable<any> {
        if (this.poolId && this.nodeId) {
            // TODO: only do this if the node is in a state to list files (e.g. idle, running, startTaskFailed, etc...)
            this.data = this.fileService.listFromComputeNode(this.poolId, this.nodeId, true, {});
            this.status = this.data.status;
            this.data.setOptions({}); // This clears the previous list objects
            return this.data.fetchNext();
        }
    }

    public onScrollToBottom(x) {
        this.data.fetchNext();
    }
}
