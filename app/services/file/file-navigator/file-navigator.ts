import { List } from "immutable";
import { BehaviorSubject, Observable } from "rxjs";

import { LoadingStatus } from "app/components/base/loading";
import { File } from "app/models";
import { RxListProxy } from "app/services/core";
import { ObjectUtils } from "app/utils";
import { FilterBuilder } from "app/utils/filter-builder";
import { FileTreeStructure } from "./file-tree.model";

export interface FileNavigatorConfig {
    basePath?: string;
    loadPath: (options: any) => RxListProxy<any, File>;
}
/**
 * Generic navigator class for a file explorer.
 * This can be extended for a node, task or blob file list
 */
export class FileNavigator {
    public currentPath: Observable<string>;
    public loadingStatus = LoadingStatus.Ready;
    public basePath: string;
    public tree: Observable<FileTreeStructure>;

    private _currentPath = new BehaviorSubject("");
    private _tree = new BehaviorSubject(new FileTreeStructure());

    private _history: string[] = [];
    private _loadPath: (options: any) => RxListProxy<any, File>;

    private _proxies: StringMap<RxListProxy<any, File>> = {};

    constructor(config: FileNavigatorConfig) {
        this.basePath = config.basePath || "";
        this._loadPath = config.loadPath;
        this.currentPath = this._currentPath.asObservable();
        this.tree = this._tree.asObservable();
    }

    /**
     * Load the inital data
     */
    public init() {
        this._loadFileInPath();
    }

    public navigateTo(path: string) {
        if (this._currentPath.value === path) { return; }
        this._history.push(this._currentPath.value);
        this._currentPath.next(path);
        console.log("Path loaded?", this._tree.value.isPathLoaded(path));
        if (!this._tree.value.isPathLoaded(path)) {
            this._loadFileInPath(path);
        }
    }

    public list(): Observable<List<File>> {
        return this._proxies[this._currentPath.value].items.first();
    }

    public dispose() {
        console.log("Dispose navigator....");
        for (let proxy of ObjectUtils.values(this._proxies)) {
            proxy.dispose();
        }
    }

    private _loadFileInPath(path: string = null) {
        this.loadingStatus = LoadingStatus.Loading;
        if (path === null) { path = this._currentPath.value; }
        console.log("Load in path", path);
        if (!this._proxies[path]) {
            this._proxies[path] = this._loadPath(this._buildLoadPathOptions(path));
        }
        const proxy = this._proxies[path];
        console.log("PRixy", proxy);
        proxy.refresh()
            .flatMap(() => proxy.items.first())
            .subscribe((files: List<File>) => {
                this.loadingStatus = LoadingStatus.Ready;

                console.log("Got files", files.toJS());
                const tree = this._tree.value;
                tree.addFiles(files);
                this._tree.next(tree);
            });
    }

    private _buildLoadPathOptions(path: string) {
        const options = {};
        if (path) {
            if (!path.endsWith("/")) {
                path = path + "/";
            }
            options["filter"] = FilterBuilder.prop("name").startswith(path).toOData();
        }
        return options;
    }
}
