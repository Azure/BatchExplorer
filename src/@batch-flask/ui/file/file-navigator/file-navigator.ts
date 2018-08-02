import { ServerError } from "@batch-flask/core";
import { LoadingStatus } from "@batch-flask/ui/loading/loading-status";
import { CloudPathUtils, StringUtils, log } from "@batch-flask/utils";
import { DataCache, ListGetter } from "app/services/core";
import { List } from "immutable";
import { AsyncSubject, BehaviorSubject, Observable, Subscription, interval, of } from "rxjs";
import { catchError, flatMap, map, mergeMap, share, shareReplay, take, tap } from "rxjs/operators";
import { FileLoader } from "../file-loader";
import { File } from "../file.model";
import { FileTreeNode, FileTreeStructure } from "./file-tree.model";

export interface DeleteProgress {
    current: string;
    deleted: number;
    total: number;
}

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
     * Optional function to handle delete in the file navigator
     */
    delete?: (filename: string) => Observable<any>;

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
    private _deleteFile: (filename: string) => Observable<any>;
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
        this._deleteFile = config.delete;
        this._onError = config.onError;
        this._tree.next(new FileTreeStructure(this.basePath));
        this.tree = this._tree.asObservable();
        this._cache = config.cache;
        this._wildcards = config.wildcards;
        this._fetchAll = config.fetchAll;
    }

    /**
     * If this file navigator has delete file implemented
     */
    public get canDeleteFile(): boolean {
        return Boolean(this._deleteFile);
    }

    /**
     * Load the inital data
     */
    public init(): Observable<any> {
        if (this._cache) {
            this._fileDeletedSub = this._cache.deleted.subscribe((key: string) => {
                this._removeFile(key);
            });
        }
        return this._loadFilesInPath("");
    }

    /**
     * @param path Path of the file/directory to navigate to
     * @param openInNewTab If its the path to a file it will open the file in a new tab
     */
    public loadPath(path: string) {
        const obs = this.getNode(path).pipe(
            mergeMap((node) => {
                return this._loadFilesInPath(path);
            }),
            shareReplay(1),
        );
        obs.subscribe(); // Make sure it trigger at least once
        return obs;
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
            return this._checkIfDirectory(node).pipe(
                map(() => {
                    return this._tree.value.getNode(path);
                }),
                catchError(() => {
                    return of(null);
                }),
            );
        } else {
            return of(node);
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
        return of(node);
    }

    public isDirectory(path: string): Observable<boolean> {
        const node = this._tree.value.getNode(path);
        return this._checkIfDirectory(node);
    }

    /**
     * Add a folder to the navigator that is only visible from the UI until some files get added to it
     * @param path Path to the folder
     */
    public addVirtualFolder(path: string) {
        const tree = this._tree.value;
        tree.addVirtualFolder(path);
        this._tree.next(tree);
    }

    public deleteFile(filename: string): Observable<any> {
        if (!this._deleteFile) {
            log.error("Cannot delete file with this file navigator has delete is not implemented");
            return;
        }
        return this._deleteFile(filename);
    }

    public deleteFiles(files: string[]): Observable<DeleteProgress> {
        if (!this._deleteFile) {
            log.error("Cannot delete file with this file navigator has delete is not implemented");
            return;
        }
        return interval(100).pipe(
            take(files.length),
            flatMap((i) => {
                return this._deleteFile(files[i]).pipe(map(() => {
                    this._removeFile(files[i]);
                    return { deleted: i, total: files.length, current: files[i] };
                }));
            }),
            share(),
        );
    }

    public deleteFolder(folder: string): Observable<DeleteProgress> {
        if (!this._deleteFile) {
            log.error("Cannot delete file with this file navigator has delete is not implemented");
            return;
        }
        return this.listAllFiles(CloudPathUtils.asBaseDirectory(folder)).pipe(
            flatMap((files) => {
                return this.deleteFiles(files.map(x => x.name).toArray());
            }),
            tap(() => {
                this._removeFile(folder);
            }),
            share(),
        );
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
        }).pipe(
            map((files) => {
                if (!this._wildcards) {
                    return files;
                }

                const filtered = files.filter((file) => file.isDirectory || this._checkWildcardMatch(file.name));
                return List(filtered);
            }),
        );
    }

    private _checkWildcardMatch(filename: string): boolean {
        const result = this._wildcards.split(",").find(wildcard => {
            return StringUtils.matchWildcard(filename, wildcard, false);
        });

        return Boolean(result);
    }

    private _checkIfDirectory(node: FileTreeNode): Observable<boolean> {
        if (!node.isUnknown) { return of(node.isDirectory); }
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
        const tree = this._tree.value;
        const node = tree.getNode(path);
        if (node.loadingStatus === LoadingStatus.Loading && !node.virtual) {
            return of(null);
        }
        node.markAsLoading();
        const output = new AsyncSubject<FileTreeNode>();
        this._loadPath(this._getFolderToLoad(path)).subscribe({
            next: (files: List<File>) => {
                this.loadingStatus = LoadingStatus.Ready;
                const tree = this._tree.value;
                tree.setFilesAt(path, files);
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
