import { Component, EventEmitter, Input, OnChanges, OnDestroy, Output, SimpleChange, ViewChild } from "@angular/core";
import { autobind } from "core-decorators";
import { List } from "immutable";
import { BehaviorSubject, Observable } from "rxjs";

import { LoadingStatus } from "app/components/base/loading";
import { TreeViewDisplayComponent, buildTreeRootFilter } from "app/components/file/browse/tree-view";
import { File, ServerError } from "app/models";
import { FileService, NodeFileListParams } from "app/services";
import { RxListProxy } from "app/services/core";
import { Filter, Property } from "app/utils/filter-builder";

@Component({
    selector: "bl-node-file-list",
    templateUrl: "file-list.html",
})
export class NodeFileListComponent implements OnChanges, OnDestroy {
    public LoadingStatus = LoadingStatus;

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

    @Output()
    public fileNameUpdate: EventEmitter<string> = new EventEmitter<string>();

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

    public ngOnDestroy(): void {
        this.status.unsubscribe();
        this.error.unsubscribe();
    }

    @autobind()
    public refresh(): Observable<any> {
        if (this.poolId && this.nodeId) {
            // filter is changed in two different situation (search field of node file list and file nav list)
            const filterProp = ((this.filter.properties && this.filter.properties.length > 0) ?
                                        this.filter.properties[0] : this.filter) as Property;
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

    public treeNodeClicked(event) {
        this.fileNameUpdate.emit(event);
    }

    private _initProxyMap(inputs) {
        let poolIdInput: SimpleChange = inputs.poolId;
        let nodeIdInput: SimpleChange = inputs.nodeId;
        if (this._hasInputChanged(poolIdInput) || this._hasInputChanged(nodeIdInput)) {
            this.treeDisplay.treeNodes = [];
            this._disposeListProxy();
            this._fileProxyMap = {} as StringMap<RxListProxy<NodeFileListParams, File>>;
            this.moreFileMap = {} as StringMap<boolean>;
        }
    }

    private _disposeListProxy() {
        for (let path in this._fileProxyMap) {
            if (path !== null) {
                this._fileProxyMap[path].dispose();
            }
        }
    }

    private _hasInputChanged(input: SimpleChange): boolean {
        return input && input.previousValue && input.currentValue !== input.previousValue;
    }
}
