import { Component, Input, OnChanges, OnInit, ViewChild } from "@angular/core";
import { autobind } from "core-decorators";
import { Observable } from "rxjs";

import { LoadingStatus } from "app/components/base/loading";
import { File, Node } from "app/models";
import { FileService, NodeFileListParams } from "app/services";
import { RxListProxy } from "app/services/core";
import { Filter, FilterBuilder, Property } from "app/utils/filter-builder";
import { List } from "immutable";

@Component({
    selector: "bl-node-file-list",
    templateUrl: "file-list.html",
})
export class NodeFileListComponent implements OnInit, OnChanges {
    public LoadingStatus = LoadingStatus;

    /**
     * If set to true it will display the quick list view, if false will use the table view
     */
    @Input()
    public quickList: boolean;

    @Input()
    public manualLoading: boolean;

    @Input()
    public poolId: string;

    @Input()
    public nodeId: string;

    @Input()
    public filter: Filter;

    /**
     * Name of the folder this list should display the content of.
     * e.g. workitems, startup
     */
    @Input()
    public folder: string = "";

    @ViewChild(NodeFileListComponent)
    public list: NodeFileListComponent;

    public status: Observable<LoadingStatus>;
    public data: RxListProxy<NodeFileListParams, File>;
    public node: Node;
    public notFound: boolean;

    private _fileProxyMap: StringMap<RxListProxy<NodeFileListParams, File>> = {};

    constructor(private fileService: FileService) {
        this.notFound = false;
        this.data = this.fileService.listFromComputeNode(null, null, true, {});
        this.status = this.data.status;
    }

    public ngOnInit() {
        return;
    }

    public ngOnChanges(inputs) {
        if (inputs.poolId || inputs.nodeId || inputs.folder || inputs.filter) {
            this.refresh();
        }
    }

    @autobind()
    public refresh(): Observable<any> {
        if (!(this.poolId && this.nodeId)) {
            return;
        }
        let options = {};
        const filter = this._buildFilter();
        if (!filter.isEmpty()) {
            options = {
                filter: filter.toOData(),
            };
        }
        this.data.updateParams({ poolId: this.poolId, nodeId: this.nodeId });
        this.data.setOptions(options); // This clears the previous list objects
        this.notFound = false;
        return this.data.fetchNext(true);
    }

    @autobind()
    public loadMore(): Observable<any> {
        return this.data.fetchNext();
    }

    public get baseUrl() {
        return ["/pools", this.poolId, "nodes", this.nodeId];
    }

    public loadPath(path: string, refresh: boolean = false): Observable<List<File>> {
        if (!(path in this._fileProxyMap)) {
            const filterPath = path ? { filter: FilterBuilder.prop("name").startswith(path).toOData() } : {};
            const poolId = this.poolId;
            const nodeId = this.nodeId;
            this._fileProxyMap[path] = this.fileService.listFromComputeNode(poolId, nodeId, false, filterPath);
        }
        let observable = refresh ?  this._fileProxyMap[path].refresh() : this._fileProxyMap[path].fetchNext();
        return observable.flatMap(() => {
            return this._fileProxyMap[path].items.first();
        });
    }

    private _buildFilter() {
        const filter: Property = this.filter as Property;
        const quickSearch = filter && filter.value;

        const name = [this.folder, quickSearch].filter(x => Boolean(x)).join("/");
        if (name) {
            return FilterBuilder.prop("name").startswith(name);
        } else {
            return FilterBuilder.none();
        }
    }
}
