import { FileLoader, FileNavigator, FileTreeNode } from "@batch-flask/ui";
import { CloudPathUtils, log } from "@batch-flask/utils";
import { BehaviorSubject, Observable, combineLatest } from "rxjs";
import { flatMap, map, shareReplay } from "rxjs/operators";

export interface FileSource {
    name?: string;
    navigator: FileNavigator;
    openedFiles?: string[];
}

export interface OpenedFile {
    path: string;
    source: FileSource;
    loader: FileLoader;
}
function sourcesFrom(data: FileNavigator | FileSource | FileSource[]): FileSource[] {
    if (data instanceof FileNavigator) {
        return [{
            name: "Files",
            navigator: data,
        }];
    } else if (Array.isArray(data)) {
        return data;
    } else {
        return [data];
    }
}

export interface CurrentNode {
    source: FileSource;
    path: string;
    treeNode: FileTreeNode;
}

export class FileExplorerWorkspace {
    public sources: FileSource[];
    public openedFiles: Observable<OpenedFile[]>;
    public currentSource: Observable<FileSource>;
    public currentNode: Observable<CurrentNode>;

    private _currentSource = new BehaviorSubject<FileSource>(null);
    private _currentPath = new BehaviorSubject("");
    private _openedFiles = new BehaviorSubject<OpenedFile[]>([]);

    constructor(data: FileNavigator | FileSource | FileSource[]) {
        this.sources = sourcesFrom(data);
        this.openedFiles = this._openedFiles.asObservable();
        this.currentSource = this._currentSource.asObservable();
        this._currentSource.next(this.sources.first());

        this.currentNode = this._currentSource.pipe(
            flatMap((source) => {
                return combineLatest(this._currentPath, source.navigator.tree).pipe(
                    map(([path, tree]) => {
                        const node = tree.getNode(path);
                        return {
                            source,
                            path: node.path,
                            treeNode: node,
                        };
                    }),
                );
            }),
            shareReplay(1),
        );

        this._openInitalFiles();
    }

    public navigateTo(path: string, source?: FileSource) {
        source = this._getSource(source);
        if (this._currentPath.value === path && this._currentSource.value === source) { return; }

        this._currentPath.next(path);
        this._currentSource.next(source);
        source.navigator.getNode(path).subscribe((node) => {
            if (!node) { return; }
            if (node.isDirectory) {
                source.navigator.loadPath(path);
            } else {
                this.openFile(node.path, source);
            }
        });
    }

    /**
     * Go back up one level
     */
    public goBack() {
        const path = this._currentPath.value;
        if (path === "") { return; }
        this.navigateTo(CloudPathUtils.dirname(path), this._currentSource.value);
    }

    public isFileOpen(path: string, source?: FileSource): boolean {
        source = this._getSource(source);
        return Boolean(this._openedFiles.value.find(x => x.path === path && x.source === source));
    }

    public openFile(path: string, source?: FileSource) {
        source = this._getSource(source);
        const openedFiles = this._openedFiles.value;
        if (!this.isFileOpen(path, source)) {
            openedFiles.push({
                source: source,
                path,
                loader: source.navigator.getFile(path),
            });
        }
        this._openedFiles.next(openedFiles);
    }

    /**
     * Triggered when a tab select to open a file
     * @param filename File to open
     *
     * If filename is null or undefined it will show the file table viewer at the last position
     */
    public openFiles(paths: string[], source?: FileSource) {
        source = this._getSource(source);

        const openedFiles = this._openedFiles.value;
        for (const path of paths) {
            if (!this.isFileOpen(path, source)) {
                openedFiles.push({
                    source: source,
                    path,
                    loader: source.navigator.getFile(path),
                });
            }
        }
        this._openedFiles.next(openedFiles);
    }

    public closeFile(path: string, source?: FileSource) {
        source = this._getSource(source);

        const newOpenedFiles = this._openedFiles.value.filter(x => x.path !== path && x.source === source);
        this._openedFiles.next(newOpenedFiles);
    }

    public dispose() {
        this.sources.forEach(x => x.navigator.dispose());
        this.sources = [];

        this._openedFiles.complete();
        this._currentSource.complete();
    }

    private _getSource(source?: FileSource) {
        if (source) { return source; }
        if (this.sources.length === 1) {
            return this.sources.first();
        } else {
            const message = "You must specify a source(FileNavigator) when using multi-source";
            log.error(message);
            throw Error(message);
        }
    }

    private _openInitalFiles() {
        for (const source of this.sources) {
            if (source.openedFiles) {
                this.openFiles(source.openedFiles, source);
            }
        }
    }
}
