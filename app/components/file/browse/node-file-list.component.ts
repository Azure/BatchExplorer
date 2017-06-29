import { Component, Input, OnChanges, SimpleChange, ViewChild } from "@angular/core";
import { LoadingStatus } from "app/components/base/loading";
import { TreeViewDisplayComponent, buildTreeRootFilter } from "app/components/file/browse/display";
import { File, ServerError } from "app/models";
import { FileService, NodeFileListParams } from "app/services";
import { RxListProxy } from "app/services/core";
import { Filter, Property } from "app/utils/filter-builder";
import { autobind } from "core-decorators";
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

    @ViewChild(TreeViewDisplayComponent)
    public treeDisplay: TreeViewDisplayComponent;
    public moreFileMap: StringMap<boolean> = {};
    public status: BehaviorSubject<LoadingStatus> = new BehaviorSubject(LoadingStatus.Loading);
    public error: BehaviorSubject<ServerError> = new BehaviorSubject(null);

    private _fileProxyMap: StringMap<RxListProxy<NodeFileListParams, File>> = {};

    constructor(private fileService: FileService) { }

    public ngOnChanges(inputs) {
        if (inputs.poolId || inputs.nodeId || inputs.folder || inputs.filter) {
            this._initProxyMap(inputs);
            this.refresh();
        }
    }

    @autobind()
    public refresh(): Observable<any> {
        if ((this.poolId && this.nodeId)) {
            const filterProp = this.filter as Property;
            const quickSearch = filterProp && filterProp.value;
            const loadPath = [this.folder, quickSearch].filter(x => Boolean(x)).join("/");
            if (this.treeDisplay) {
                return this.treeDisplay.initNodes(loadPath, true);
            }
        }
        return Observable.of(true);
    }

    public get baseUrl() {
        return ["/pools", this.poolId, "nodes", this.nodeId];
    }

    @autobind()
    public loadPath(path: string, refresh: boolean = false): Observable<List<File>> {
        if (!(path in this._fileProxyMap)) {
            const options = buildTreeRootFilter(path);
            const poolId = this.poolId;
            const nodeId = this.nodeId;
            this._fileProxyMap[path] = this.fileService.listFromComputeNode(poolId, nodeId, false, options);
            this._fileProxyMap[path].hasMore.subscribe((hasMore) => {
                this.moreFileMap[path] = hasMore;
            });
            this._fileProxyMap[path].status.subscribe((status) => {
                this.status.next(status);
            });
            this._fileProxyMap[path].error.subscribe((error) => {
                this.error.next(error);
            });
        }
        let observable = refresh ? this._fileProxyMap[path].refresh() : this._fileProxyMap[path].fetchNext();
        return observable.flatMap(() => {
            return this._fileProxyMap[path].items.first();
        });
    }

    private _initProxyMap(inputs) {
        let poolIdInput: SimpleChange = inputs.poolId;
        let nodeIdInput: SimpleChange = inputs.nodeId;
        if (poolIdInput && poolIdInput.previousValue && poolIdInput.currentValue !== poolIdInput.previousValue ||
            nodeIdInput && nodeIdInput.previousValue && nodeIdInput.currentValue !== nodeIdInput.previousValue) {
            this._fileProxyMap = {} as StringMap<RxListProxy<NodeFileListParams, File>>;
        }
    }
}
