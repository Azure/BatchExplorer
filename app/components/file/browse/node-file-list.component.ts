import { Component, Input, OnChanges, ViewChild } from "@angular/core";
import { LoadingStatus } from "app/components/base/loading";
import { FileListDisplayComponent } from "app/components/file/browse/display";
import { File, ServerError } from "app/models";
import { FileService, NodeFileListParams } from "app/services";
import { RxListProxy } from "app/services/core";
import { Filter, FilterBuilder, Property } from "app/utils/filter-builder";
import { List } from "immutable";
import { BehaviorSubject, Observable } from "rxjs";

@Component({
    selector: "bl-node-file-list",
    templateUrl: "file-list.html",
})
export class NodeFileListComponent implements OnChanges {
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

    @ViewChild(FileListDisplayComponent)
    public listDisplay: FileListDisplayComponent;

    public status: BehaviorSubject<LoadingStatus> = new BehaviorSubject(LoadingStatus.Loading);
    public error: BehaviorSubject<ServerError> = new BehaviorSubject(null);

    private _fileProxyMap: StringMap<RxListProxy<NodeFileListParams, File>> = {};

    constructor(private fileService: FileService) { }

    public ngOnChanges(inputs) {
        if (inputs.poolId || inputs.nodeId || inputs.folder || inputs.filter) {
            this.refresh();
        }
    }

    public refresh() {
        if (!(this.poolId && this.nodeId)) {
            return;
        }
        const filterProp = this.filter as Property;
        const quickSearch = filterProp && filterProp.value;
        const loadPath = [this.folder, quickSearch].filter(x => Boolean(x)).join("/");
        if (this.listDisplay) {
            console.log(`Init Nodes with ${this.poolId}(poolId) and ${this.nodeId}(nodeId)`);
            this.listDisplay.initNodes(loadPath);
        }
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
        this._fileProxyMap[path].status.subscribe((status) => {
            this.status.next(status);
        });
        this._fileProxyMap[path].error.subscribe((error) => {
            this.error.next(error);
        });
        let observable = refresh ?  this._fileProxyMap[path].refresh() : this._fileProxyMap[path].fetchNext();
        return observable.flatMap(() => {
            return this._fileProxyMap[path].items.first();
        });
    }
}
