import { FileLoader, FileNavigator, FileTreeNode } from "app/services/file";
import { BehaviorSubject, Observable } from "rxjs";

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

export class FileExporerWorkspace {
    public sources: FileSource[];
    public openedFiles: Observable<OpenedFile[]>;
    // public openedFolder: Observable<any>;
    public currentSource: Observable<FileSource>;
    public currentNode: Observable<FileTreeNode>;

    private _currentSource = new BehaviorSubject<FileSource>(null);
    private _currentPath = new BehaviorSubject("");
    private _openedFiles = new BehaviorSubject<OpenedFile[]>([]);
    // private _openedFolder = new BehaviorSubject<any>(null);

    constructor(data: FileNavigator | FileSource | FileSource[]) {
        this.sources = sourcesFrom(data);
        this.openedFiles = this._openedFiles.asObservable();
        // this.openedFolder = this._openedFolder.asObservable();
        this.currentSource = this._currentSource.asObservable();
        this._currentSource.next(this.sources.first());

        this.currentNode = this._currentSource.flatMap((source) => {
            return Observable.combineLatest(this._currentPath, source.navigator.tree);
        }).map(([path, tree]) => {
            return tree.getNode(path).clone();
        }).shareReplay(1);
    }

    public navigateTo(path: string, source?: FileSource) {
        source = this._getSource(source);
        if (this._currentPath.value === path && this._currentSource.value === source) { return; }
        this._currentPath.next(path);
        this._currentSource.next(source);
        source.navigator.navigateTo(path);
    }

    public isFileOpen(path: string): boolean {
        return Boolean(this._openedFiles.value.find(x => x.path === path));
    }

    public openFile(path: string, source?: FileSource) {
        source = this._getSource(source);
        const openedFiles = this._openedFiles.value;
        if (!this.isFileOpen(path)) {
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
        for (let path of paths) {
            if (!this.isFileOpen(path)) {
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

    private _getSource(source?: FileSource) {
        if (source) { return source; }
        if (this.sources.length === 1) {
            return this.sources.first();
        } else {
            throw Error("You must specify a source(FileNavigator) when using multi-source");
        }
    }
}
