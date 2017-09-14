import { List } from "immutable";
import { BehaviorSubject, Observable } from "rxjs";

import { LoadingStatus } from "app/components/base/loading";
import { File, ServerError } from "app/models";
import { RxListProxy } from "app/services/core";
import { FileLoader } from "app/services/file";
import { CloudPathUtils, ObjectUtils } from "app/utils";
import { FileTreeNode, FileTreeStructure, OpenedFile } from "./file-tree.model";

export interface FileNavigatorConfig {
    /**
     * Base path for the navigation. If you need to only show a sub folder.
     * If given it will act as if the root is that base path
     * and will not be aware of anyother folder at the same level and above
     */
    basePath?: string;

    /**
     * Callback to be called everytime it loads a new folder.
     * @param folder: Folder that needs to be loaded. If root. will be null.
     * @returns  a new RxListProxy
     */
    loadPath: (folder: string) => RxListProxy<any, File>;

    /**
     * Callback called when navigating to a file.
     * @param filename Fullpath to the file to load.
     * @returns a new file loader
     */
    getFile: (filename: string) => FileLoader;

    /**
     * Optional callback that gets called when an error is returned listing files.
     * You can that way ignore the error or modify it.
     * Return null to ignore error.
     */
    onError?: (error: ServerError) => ServerError;

}
/**
 * Generic navigator class for a file explorer.
 * This can be extended for a node, task or blob file list
 */
export class FileNavigator {
    /**
     * Path of the file/directory currently being viewed
     */
    public currentPath: Observable<string>;

    /**
     * Tree node that is currently being viewed
     */
    public currentNode: Observable<FileTreeNode>;
    public loadingStatus = LoadingStatus.Ready;
    public basePath: string;
    public tree: Observable<FileTreeStructure>;

    /**
     * Current file loader to display
     */
    public currentFileLoader: FileLoader;

    /**
     * List of files opended for a quick switch
     */
    public openedFiles: Observable<OpenedFile[]>;
    public _openedFiles = new BehaviorSubject([]);
    public error: ServerError;

    private _currentPath = new BehaviorSubject("");
    private _tree = new BehaviorSubject<FileTreeStructure>(null);

    private _history: string[] = [];
    private _loadPath: (folder: string) => RxListProxy<any, File>;

    private _proxies: StringMap<RxListProxy<any, File>> = {};
    private _getFileLoader: (filename: string) => FileLoader;
    private _onError: (error: ServerError) => ServerError;

    constructor(config: FileNavigatorConfig) {
        this.basePath = config.basePath || "";
        this._loadPath = config.loadPath;
        this._getFileLoader = config.getFile;
        this._onError = config.onError;
        this.currentPath = this._currentPath.asObservable();
        this._tree.next(new FileTreeStructure(this.basePath));
        this.currentNode = Observable.combineLatest(this._currentPath, this._tree).map(([path, tree]) => {
            return tree.getNode(path).clone();
        }).shareReplay(1);
        this.tree = this._tree.asObservable();
        this.openedFiles = this._openedFiles.asObservable();
    }

    /**
     * Load the inital data
     */
    public init() {
        this._loadFileInPath();
    }

    /**
     * @param path Path of the file/directory to navigate to
     * @param openInNewTab If its the path to a file it will open the file in a new tab
     */
    public navigateTo(path: string, openInNewTab: boolean = true) {
        if (this._currentPath.value === path) { return; }
        this._history.push(this._currentPath.value);
        this._currentPath.next(path);
        const node = this._tree.value.getNode(path);
        if (node.isDirectory) {
            if (!this._tree.value.isPathLoaded(path)) {
                this._loadFileInPath(path);
            }
        } else {
            this.openFile(path, openInNewTab);
        }
    }

    public isFileOpen(path: string): boolean {
        return Boolean(this._openedFiles.value.find(x => x.path === path));
    }

    public openFile(path: string, openInNewTab: boolean = true) {
        const openedFiles = this._openedFiles.value;
        if (!this.isFileOpen(path)) {
            if (openInNewTab) {
                openedFiles.push({
                    path,
                    fileLoader: this._getFileLoader(path),
                });
            }
        }
        this._openedFiles.next(openedFiles);
    }

    /**
     * Triggered when a tab select to open a file
     * @param filename File to open
     *
     * If filename is null or undefined it will show the file table viewer at the last position
     */
    public openFiles(paths: string[]) {
        const openedFiles = this._openedFiles.value;
        for (let path of paths) {
            if (!this.isFileOpen(path)) {
                openedFiles.push({
                    path,
                    fileLoader: this._getFileLoader(path),
                });
            }
        }
        this._openedFiles.next(openedFiles);
    }

    /**
     * Go back up one level
     */
    public goBack() {
        const path = this._currentPath.value;
        if (path === "") { return; }
        this.navigateTo(path.split("/").slice(0, -1).join("/"));
    }

    public list(): Observable<List<File>> {
        return this._proxies[this._currentPath.value].items.first();
    }

    public refresh(path: string = ""): Observable<any> {
        return this._loadFileInPath(path);
    }

    public loadPath(path: string = ""): Observable<any> {
        const node = this._tree.value.getNode(path);
        if (node.isDirectory) {
            if (!this._tree.value.isPathLoaded(path)) {
                return this._loadFileInPath(path);
            }
        }
        return Observable.of(null);
    }

    public dispose() {
        for (let proxy of ObjectUtils.values(this._proxies)) {
            proxy.dispose();
        }
    }

    private _loadFileInPath(path: string = null): Observable<any> {
        this.loadingStatus = LoadingStatus.Loading;
        if (path === null) { path = this._currentPath.value; }
        if (!this._proxies[path]) {
            this._proxies[path] = this._loadPath(this._getFolderToLoad(path));
        }
        const proxy = this._proxies[path];
        const obs = proxy.refresh().flatMap(() => proxy.items.first()).share();
        obs.subscribe({
            next: (files: List<File>) => {
                this.loadingStatus = LoadingStatus.Ready;

                const tree = this._tree.value;
                tree.addFiles(files);
                tree.getNode(path).markAsLoaded();
                this._tree.next(tree);
            },
            error: (error) => {
                if (this._onError) {
                    error = this._onError(error);
                    if (!error) { return; }
                }
                this.error = error;
                const tree = this._tree.value;
                tree.getNode(path).loadingStatus = LoadingStatus.Error;
                this._tree.next(tree);
            },
        });

        return obs;
    }

    private _getFolderToLoad(path: string) {
        let fullPath = [this.basePath, path].filter(x => Boolean(x)).join("/");
        if (fullPath) {
            return CloudPathUtils.asBaseDirectory(fullPath);
        }
        return null;
    }
}
