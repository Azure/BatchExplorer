import { List } from "immutable";
import { AsyncSubject, BehaviorSubject, Observable } from "rxjs";

import { LoadingStatus } from "app/components/base/loading";
import { File, ServerError } from "app/models";
import { RxListProxy } from "app/services/core";
import { FileLoader } from "app/services/file";
import { CloudPathUtils, ObjectUtils } from "app/utils";
import { FileTreeNode, FileTreeStructure } from "./file-tree.model";

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
    public loadingStatus = LoadingStatus.Ready;
    public basePath: string;
    public tree: Observable<FileTreeStructure>;

    public error: ServerError;

    private _tree = new BehaviorSubject<FileTreeStructure>(null);
    private _loadPath: (folder: string) => RxListProxy<any, File>;

    private _proxies: StringMap<RxListProxy<any, File>> = {};
    private _getFileLoader: (filename: string) => FileLoader;
    private _onError: (error: ServerError) => ServerError;

    constructor(config: FileNavigatorConfig) {
        this.basePath = config.basePath || "";
        this._loadPath = config.loadPath;
        this._getFileLoader = config.getFile;
        this._onError = config.onError;
        this._tree.next(new FileTreeStructure(this.basePath));
        this.tree = this._tree.asObservable();
    }

    /**
     * Load the inital data
     */
    public init() {
        this._loadFilesInPath("");
    }

    /**
     * @param path Path of the file/directory to navigate to
     * @param openInNewTab If its the path to a file it will open the file in a new tab
     */
    public loadPath(path: string) {
        return this.getNode(path).cascade((node) => {
            return this._loadFilesInPath(path);
        }).shareReplay(1);
    }

    /**
     * Get the node at the path. If the node is not in the tree it will list
     * @param path Path of the node
     * @returns the node if it exsits or null if not
     */
    public getNode(path: string): Observable<FileTreeNode> {
        const node = this._tree.value.getNode(path);
        if (node.isUnknown) {
            return this._checkIfDirectory(node).map(() => {
                return this._tree.value.getNode(path);
            }).catch(() => {
                return Observable.of(null);
            });
        } else {
            return Observable.of(node);
        }
    }

    public getFile(path: string): FileLoader {
        const loader = this._getFileLoader(CloudPathUtils.join(this.basePath, path));
        loader.basePath = this.basePath;
        return loader;
    }

    public refresh(path: string = ""): Observable<any> {
        return this._loadFilesInPath(path);
    }

    public loadFilesInPath(path: string = ""): Observable<any> {
        const node = this._tree.value.getNode(path);
        if (node.isDirectory) {
            if (!this._tree.value.isPathLoaded(path)) {
                return this._loadFilesInPath(path);
            }
        }
        return Observable.of(node);
    }

    public dispose() {
        for (let proxy of ObjectUtils.values(this._proxies)) {
            proxy.dispose();
        }
    }

    public isDirectory(path: string): Observable<boolean> {
        const node = this._tree.value.getNode(path);
        return this._checkIfDirectory(node);
    }

    private _checkIfDirectory(node: FileTreeNode): Observable<boolean> {
        if (!node.isUnknown) { return Observable.of(node.isDirectory); }
        const proxy = this._loadPath(this._getFolderToLoad(node.path, false));
        const obs = proxy.refresh().flatMap(() => proxy.items.first()).shareReplay(1);
        const subject = new AsyncSubject<boolean>();
        obs.first().subscribe({
            next: (files: List<File>) => {
                proxy.dispose();
                if (files.size === 0) { return false; }
                const file = files.first();
                this._tree.value.addFiles(files);
                subject.next(file.isDirectory);
                subject.complete();
            },
            error: (e) => (error) => {
                proxy.dispose();
                subject.error(error);
            },
        });
        return subject.asObservable();
    }

    private _loadFilesInPath(path: string): Observable<FileTreeNode> {
        this.loadingStatus = LoadingStatus.Loading;
        if (!this._proxies[path]) {
            this._proxies[path] = this._loadPath(this._getFolderToLoad(path));
        }

        const proxy = this._proxies[path];
        const output = new AsyncSubject<FileTreeNode>();
        proxy.refresh().flatMap(() => proxy.items.first()).share().subscribe({
            next: (files: List<File>) => {
                this.loadingStatus = LoadingStatus.Ready;

                const tree = this._tree.value;
                tree.addFiles(files);
                const node = tree.getNode(path);
                node.markAsLoaded();
                this._tree.next(tree);
                output.next(node);
                output.complete();
            },
            error: (error) => {
                if (this._onError) {
                    error = this._onError(error);
                    if (!error) { return; }
                }
                this.error = error;
                const tree = this._tree.value;
                const node = tree.getNode(path);
                node.loadingStatus = LoadingStatus.Error;
                this._tree.next(tree);
                output.next(node);
                output.complete();
            },
        });

        return output;
    }

    private _getFolderToLoad(path: string, asDirectory = true) {
        let fullPath = [this._normalizedBasePath, path].filter(x => Boolean(x)).join("");
        if (fullPath) {
            if (asDirectory) {
                return CloudPathUtils.asBaseDirectory(fullPath);
            } else {
                return fullPath;
            }
        }
        return null;
    }

    private get _normalizedBasePath() {
        return this.basePath
            ? CloudPathUtils.asBaseDirectory(this.basePath)
            : this.basePath;
    }
}
