import { List } from "immutable";
import { AsyncSubject, BehaviorSubject, Observable, Subscription } from "rxjs";

import { ServerError } from "@batch-flask/core";
import { LoadingStatus } from "@batch-flask/ui/loading/loading-status";
import { File } from "app/models";
import { DataCache, ListGetter } from "app/services/core";
import { FileLoader } from "app/services/file";
import { CloudPathUtils, StringUtils } from "app/utils";
import { FileTreeNode, FileTreeStructure } from "./file-tree.model";

export interface FileNavigatorConfig<TParams = any> {
    /**
     *  Method that return the cache given the params.
     * This allow the use of targeted data cache which depends on some params.
     */
    cache?: DataCache<File>;

    /**
     * Base path for the navigation. If you need to only show a sub folder.
     * If given it will act as if the root is that base path
     * and will not be aware of anyother folder at the same level and above
     */
    basePath?: string;

    /**
     * Params to pass to the getter
     */
    params: TParams;

    /**
     * List getter that is used to load the data
     */
    getter: ListGetter<File, TParams>;

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

    /**
     * Optional wildcard filter that will client side match files/blobs that end with
     * this filter.
     */
    wildcards?: string;

    /**
     * Optional flag to tell the navigator to fetch all items.
     */
    fetchAll?: boolean;
}
/**
 * Generic navigator class for a file explorer.
 * This can be extended for a node, task or blob file list
 */
export class FileNavigator<TParams = any> {
    public loadingStatus = LoadingStatus.Ready;
    public basePath: string;
    public tree: Observable<FileTreeStructure>;
    public error: ServerError;

    private _tree = new BehaviorSubject<FileTreeStructure>(null);
    private _getter: ListGetter<File, TParams>;
    private _params: TParams;
    private _cache: DataCache<File>;
    private _fileDeletedSub: Subscription;
    private _wildcards: string;
    private _fetchAll: boolean;

    private _getFileLoader: (filename: string) => FileLoader;
    private _onError: (error: ServerError) => ServerError;

    constructor(config: FileNavigatorConfig<TParams>) {
        this.basePath = config.basePath || "";
        this._getter = config.getter;
        this._params = config.params;
        this._getFileLoader = config.getFile;
        this._onError = config.onError;
        this._tree.next(new FileTreeStructure(this.basePath));
        this.tree = this._tree.asObservable();
        this._cache = config.cache;
        this._wildcards = config.wildcards;
        this._fetchAll = config.fetchAll;
    }

    /**
     * Load the inital data
     */
    public init() {
        this._loadFilesInPath("");
        if (this._cache) {
            this._fileDeletedSub = this._cache.deleted.subscribe((key: string) => {
                this._removeFile(key);
            });
        }
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

    public listAllFiles(path: string = ""): Observable<List<File>> {
        return this._loadPath(path, true);
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

    public isDirectory(path: string): Observable<boolean> {
        const node = this._tree.value.getNode(path);
        return this._checkIfDirectory(node);
    }

    public dispose() {
        if (this._fileDeletedSub) {
            this._fileDeletedSub.unsubscribe();
        }
    }

    private _removeFile(key: string) {
        const tree = this._tree.value;
        tree.deleteNode(key);
        this._tree.next(tree);
    }

    /**
     * Given a path will return all the files underneath
     * @param path Path to the folder to load
     * @param recursive If it should list sub folders content too(Default: false)
     */
    private _loadPath(path: string, recursive = false): Observable<List<File>> {
        return this._getter.fetchAll(this._params, {
            recursive: recursive || this._fetchAll,
            folder: path,
        }).flatMap((files) => {
            if (!this._wildcards) {
                return Observable.of(files);
            }

            const filtered = files.filter((file) => file.isDirectory || this._checkWildcardMatch(file.name));
            return Observable.of(List(filtered));
        });
    }

    private _checkWildcardMatch(filename: string): boolean {
        const result = this._wildcards.split(",").find(wildcard => {
            return StringUtils.matchWildcard(filename, wildcard, false);
        });

        return Boolean(result);
    }

    private _checkIfDirectory(node: FileTreeNode): Observable<boolean> {
        if (!node.isUnknown) { return Observable.of(node.isDirectory); }
        const subject = new AsyncSubject<boolean>();
        this._loadPath(this._getFolderToLoad(node.path, false)).subscribe({
            next: (files: List<File>) => {
                if (files.size === 0) { return false; }
                const file = files.first();
                this._tree.value.addFiles(files);
                subject.next(file.isDirectory);
                subject.complete();
            },
            error: (e) => (error) => {
                subject.error(error);
            },
        });
        return subject.asObservable();
    }

    private _loadFilesInPath(path: string): Observable<FileTreeNode> {
        this.loadingStatus = LoadingStatus.Loading;
        const output = new AsyncSubject<FileTreeNode>();
        this._loadPath(this._getFolderToLoad(path)).subscribe({
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
        const fullPath = [this._normalizedBasePath, path].filter(x => Boolean(x)).join("");
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
