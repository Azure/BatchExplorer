import { Injectable, OnDestroy } from "@angular/core";
import { BasicListGetter, DataCache } from "@batch-flask/core";
import { File, FileLoader, FileNavigator, FileSystemService } from "@batch-flask/ui";
import { NcjTemplateType } from "app/models";
import { Constants } from "common";
import * as path from "path";
import { BehaviorSubject, Observable, from } from "rxjs";
import { filter, tap } from "rxjs/operators";
import stripBom from "strip-bom";
import { LocalFileStorage } from "../local-file-storage.service";

export interface LocalTemplateFolder {
    path: string;
    name: string;
}

export interface LocalTemplate {
    filename: string;
    description: string;
    path: string;
    source: LocalTemplateFolder;
    type: NcjTemplateType;
}

export interface LocalTemplateSettings {
    sources: LocalTemplateFolder[];
}

@Injectable({providedIn: "root"})
export class LocalTemplateService implements OnDestroy {
    public sources: Observable<LocalTemplateFolder[]>;

    private _sources = new BehaviorSubject<LocalTemplateFolder[]>(null);
    private _localTemplatesGetter: BasicListGetter<File, any>;
    private _cache = new DataCache<File>("url");

    constructor(private localFileStorage: LocalFileStorage, private fs: FileSystemService) {
        this.sources = this._sources.pipe(filter(x => x !== null));
        this.init();

        this._localTemplatesGetter = new BasicListGetter<File, any>(File, {
            cache: () => this._cache,
            supplyData: (params, options) => {
                const folder = options.original.folder
                    ? path.join(params.source.path, options.original.folder)
                    : params.source.path;
                return from(this._findTemplatesInFolder(folder).then((templates) => {
                    return {
                        data: templates.map((file) => {
                            const name = path.relative(params.source.path, file);
                            return { name, url: `file://${file}`, properties: {}, isDirectory: false };
                        }),
                    };
                }));
            },
        });
    }

    public init() {
        const obs = this._loadSources();
        obs.subscribe();
        return obs;
    }

    public ngOnDestroy() {
        this._sources.complete();
    }

    public addSource(source: LocalTemplateFolder): Observable<any> {
        this._sources.next(this._sources.value.concat([source]));
        return this._saveSources();
    }

    public removeSource(path: string): Observable<any> {
        this._sources.next(this._sources.value.filter(x => x.path !== path));
        return this._saveSources();
    }

    public setSources(sources: LocalTemplateFolder[]) {
        this._sources.next(sources);
        return this._saveSources();
    }

    /**
     * Create a blob files naviagotor to be used in a tree view.
     * @param container Azure storage container id
     * @param prefix Prefix to make the root of the tree
     * @param options List options
     */
    public navigate(source: LocalTemplateFolder) {
        return new FileNavigator({
            params: { source },
            getter: this._localTemplatesGetter,
            getFile: (filename: string) => this.getFileLoader(source, filename),
            fetchAll: true,
        });
    }

    public getFileLoader(source: LocalTemplateFolder, filename: string) {
        return new FileLoader({
            filename,
            source: "local",
            fs: this.fs,
            properties: () => from(this._getFileProperties(source, filename)),
            content: () => {
                return from(this.fs.readFile(path.join(source.path, filename)).then(x => ({ content: x })));
            },
        });
    }

    public parseNcjTemplate(template: string) {
        const json = JSON.parse(stripBom(template));
        let templateType: NcjTemplateType;
        if (json.job) {
            templateType = NcjTemplateType.Job;
        } else if (json.pool) {
            templateType = NcjTemplateType.Pool;
        } else {
            templateType = NcjTemplateType.Unknown;
        }

        return { type: templateType, template: json };
    }

    public async loadLocalTemplateFile(path: string) {
        return this.fs.readFile(path).then(content => this.parseNcjTemplate(content));
    }

    private async _getFileProperties(source: LocalTemplateFolder, filename: string): Promise<File> {
        const stats = await this.fs.stat(path.join(source.path, filename));
        return new File({
            name: filename,
            url: filename,
            properties: {
                lastModified: stats.mtime,
                contentLength: stats.size,
                creationTime: stats.birthtime,
            },
        });
    }

    private _saveSources(): Observable<any> {
        return this.localFileStorage.set<LocalTemplateSettings>(Constants.SavedDataFilename.localTemplates, {
            sources: this._sources.value,
        });
    }

    private _loadSources(): Observable<any> {
        return this.localFileStorage.get<LocalTemplateSettings>(Constants.SavedDataFilename.localTemplates).pipe(
            tap((data) => {
                if (data && data.sources) {
                    this._sources.next(data.sources);
                } else {
                    this._sources.next([]);
                }
            }),
        );
    }

    private async _findTemplatesInFolder(folder: string): Promise<string[]> {
        return this.fs.glob(path.join(folder, "**/*.template.json"));
    }
}
