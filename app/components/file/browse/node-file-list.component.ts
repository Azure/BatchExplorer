import { Component, Input, OnInit, ViewChild } from "@angular/core";
import { autobind } from "core-decorators";
import { Observable } from "rxjs";

import { LoadingStatus } from "app/components/base/loading";
import { File, Node, NodeFileTypes } from "app/models";
import { FileService, NodeFileListParams } from "app/services";
import { RxListProxy } from "app/services/core";
import { Filter } from "app/utils/filter-builder";

@Component({
    selector: "bex-node-file-list",
    templateUrl: "file-list.html",
})
export class NodeFileListComponent implements OnInit {
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
    public set nodeId(value: string) {
        this._nodeId = (value && value.trim());
        this.refresh();
    }
    public get nodeId() { return this._nodeId; }

    @Input()
    public set filter(filter: Filter) {
        this._filter = filter;

        if (this.data) {
            if (filter.isEmpty()) {
                this.data.setOptions({});
            } else {
                this.data.setOptions({ filter: filter.toOData() });
            }

            this.data.fetchNext();
        }
    }
    public get filter(): Filter { return this._filter; };

    @Input()
    public set fileType(value: NodeFileTypes) {
        this._fileType = value;
    }
    public get fileType(): NodeFileTypes { return this._fileType; }

    @ViewChild(NodeFileListComponent)
    public list: NodeFileListComponent;

    public status: Observable<LoadingStatus>;
    public data: RxListProxy<NodeFileListParams, File>;
    public node: Node;
    public notFound: boolean;

    private _filter: Filter;
    private _poolId: string;
    private _nodeId: string;
    private _fileType: NodeFileTypes;

    constructor(private fileService: FileService) {
        this.notFound = false;
    }

    public ngOnInit() {
        return;
    }

    @autobind()
    public refresh(): Observable<any> {
        if (this.poolId && this.nodeId) {
            // only load files if the node exists and is in a state to list files
            // (e.g. idle, running, startTaskFailed, etc...)
            this.data = this.fileService.listFromComputeNode(this.poolId, this.nodeId, true, {});
            this.status = this.data.status;
            this.data.setOptions({}); // This clears the previous list objects
            this.notFound = false;
            return this.data.fetchNext();
        }
    }

    @autobind()
    public loadMore(): Observable<any> {
        return this.data.fetchNext();
    }
}
