import { Injectable, OnDestroy } from "@angular/core";
import { File, FileLoader, FileNavigator, FileSystemService } from "@batch-flask/ui";
import { NcjTemplateType } from "app/models";
import { Constants } from "common";
import loadJsonFile from "load-json-file";
import * as path from "path";
import { BehaviorSubject, Observable, from, of } from "rxjs";
import { flatMap, shareReplay, tap } from "rxjs/operators";
import { BasicListGetter, DataCache } from "src/@batch-flask/core";
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

@Injectable()
export class LocalTemplateService implements OnDestroy {
    public templates: Observable<LocalTemplate[]>;
    public sources: Observable<LocalTemplateFolder[]>;

    private _sources = new BehaviorSubject<LocalTemplateFolder[]>([]);
    private _localTemplatesGetter: BasicListGetter<File, any>;
    private _cache = new DataCache<File>("url");

    constructor(private localFileStorage: LocalFileStorage, private fs: FileSystemService) {
        this.sources = this._sources.asObservable();
        this.templates = this._sources.pipe(
            flatMap((sources) => from(this._findTemplates(sources))),
            shareReplay(1),
        );
        this.init();

        // TODO-TIM handle different sources
        this._localTemplatesGetter = new BasicListGetter<File, any>(File, {
            cache: () => this._cache,
            supplyData: (params, options) => {
                const folder = options.original.folder
                    ? path.join(params.source.path, options.original.folder)
                    : params.source.path;
                return from(this._findTemplatesInFolder(folder).then((templates) => {
                    return {
                        data: templates.map((file) =>  {
                            const name = path.relative(params.source.path, file);
                            return { name, url: `file://${file}`, properties: {}, isDirectory: false };
                        }),
                    };
                }));
            },
        });
    }

    public init() {
        this._loadSources().subscribe();
    }

    public ngOnDestroy() {
        this._sources.complete();
    }

    public addSource(source: LocalTemplateFolder): Observable<any> {
        this._sources.next(this._sources.value.concat([source]));
        return this._saveSources();
    }

    public removeSource(path: string): Observable<any> {
        this._sources.next(this._sources.value.filter(x => x.path === path));
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
            properties: () => of(new File({ name: filename, url: filename, properties: { contentLength: 0 } })),
            content: () => {
                return from(this.fs.readFile(path.join(source.path, filename)).then(x => ({ content: x })));
            },
        });
    }

    public async loadLocalTemplateFile(path: string) {
        const json = await loadJsonFile<any>(path).then((content) => {
            return content;
        }).catch((error) => {
            return Promise.reject(`File is not valid json: ${error.message}`);
        });

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

    private _saveSources(): Observable<any> {
        return this.localFileStorage.set<LocalTemplateSettings>(Constants.SavedDataFilename.localTemplates, {
            sources: this._sources.value,
        });
    }

    private _loadSources(): Observable<any> {
        return this.localFileStorage.get<LocalTemplateSettings>(Constants.SavedDataFilename.localTemplates).pipe(
            tap((data) => {
                if (data.sources) {
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

    private async _findTemplates(sources: LocalTemplateFolder[]): Promise<LocalTemplate[]> {
        const array = await Promise.all(sources.map(x => this._findTemplatesInSource(x)));
        return array.flatten();
    }

    private async _findTemplatesInSource(source: LocalTemplateFolder): Promise<LocalTemplate[]> {
        const files = await this.fs.glob(path.join(source.path, "**/*.template.json"));

        const localTemplates = [];

        for (const file of files) {
            try {
                const { template, type } = await this.loadLocalTemplateFile(file);
                const localTemplate: LocalTemplate = {
                    path: path.relative(source.path, file),
                    filename: path.basename(file),
                    description: null,
                    source,
                    type,
                };
                if (template.templateMetadata) {
                    localTemplate.description = template.templateMetadata.description;
                }
                localTemplates.push(localTemplate);
            } catch (e) {
                // Ignore
            }
        }

        return localTemplates;
    }
}
