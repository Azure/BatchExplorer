import { Component, Input, OnChanges, OnInit, ViewChild } from "@angular/core";
import { autobind } from "core-decorators";
import { Observable } from "rxjs";

import { LoadingStatus } from "app/components/base/loading";
import { FileListDisplayComponent } from "app/components/file/browse/display";
import { File } from "app/models";
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

    @ViewChild(FileListDisplayComponent)
    public listDisplay: FileListDisplayComponent;

    // public status: Observable<LoadingStatus>;
    // public data: RxListProxy<NodeFileListParams, File>;
    // public node: Node;
    public notFound: boolean;

    private _fileProxyMap: StringMap<RxListProxy<NodeFileListParams, File>> = {};

    constructor(private fileService: FileService) {
        this.notFound = false;

        // this.data = this.fileService.listFromComputeNode(null, null, true, {});
        // this.status = this.data.status;
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
    public refresh() {
        if (!(this.poolId && this.nodeId)) {
            return;
        }
        const filterProp = this.filter as Property;
        const quickSearch = filterProp && filterProp.value;
        const loadPath = [this.folder, quickSearch].filter(x => Boolean(x)).join("/");
        if (this.listDisplay) {
            this.listDisplay.initNodes(loadPath);
        }
        // console.log("info", this.folder, this.filter, this.tree);
        // let filesObs = this.treeComponentUtils.initNodes(this.fileService,
        //                         this.poolId, this.nodeId, this.folder, this.filter);
        // filesObs.subscribe((files) => {
        //     if (files.size > 0) {
        //         this.treeNodes = files.map(this.treeComponentUtils.mappingFilesToTree).toArray();
        //         this.treeOptions = this.treeComponentUtils.getFileTreeOption();
        //         console.log("result treeNodes after update", this.treeNodes);
        //     } else {
        //         this.notFound = true;
        //     }
        // });
        // const filter: Property = this.filter as Property;
        // const quickSearch = filter && filter.value;
        // const filterOption = this._buildFilter();
        // let options = !filterOption.isEmpty() ? { filter: filterOption.toOData() } : {};
        // if (!(quickSearch in this._fileProxyMap)) {
        //     const poolId = this.poolId;
        //     const nodeId = this.nodeId;
        //     this._fileProxyMap[quickSearch] = this.fileService.listFromComputeNode(poolId, nodeId, false, options);
        //     return this._fileProxyMap[quickSearch].fetchNext(true);
        // }
        // return this._fileProxyMap[quickSearch].refresh();
    }

    @autobind()
    public loadMore(): Observable<any> {
        return null;
        // return this.data.fetchNext();
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
}
