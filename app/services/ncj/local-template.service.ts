import { Injectable, OnDestroy } from "@angular/core";
import { FileSystemService } from "@batch-flask/ui";
import { NcjTemplateType } from "app/models";
import { Constants } from "common";
import * as loadJsonFile from "load-json-file";
import * as path from "path";
import { BehaviorSubject, Observable, from } from "rxjs";
import { flatMap, shareReplay, tap } from "rxjs/operators";
import { LocalFileStorage } from "../local-file-storage.service";

export interface LocalTemplateFolder {
    path: string;
    alias: string;
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

    constructor(private localFileStorage: LocalFileStorage, private fs: FileSystemService) {
        this.sources = this._sources.asObservable();
        this.templates = this._sources.pipe(
            flatMap((sources) => from(this._findTemplates(sources))),
            shareReplay(1),
        );
        this.init();
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

    public async loadLocalTemplateFile(path: string) {
        const json = await loadJsonFile(path).then((content) => {
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

    private async _findTemplates(sources: LocalTemplateFolder[]): Promise<LocalTemplate[]> {
        const array = await Promise.all(sources.map(x => this._findTemplatesInSource(x)));
        return array.flatten();
    }

    private async _findTemplatesInSource(source: LocalTemplateFolder): Promise<LocalTemplate[]> {
        const files = await this.fs.glob(path.join(source.path, "**/*.template.json"));

        const localTemplates = [];

        console.log("File co", files.length);
        for (const file of files) {
            console.log("File", file);
            try {
                const {template, type} = await this.loadLocalTemplateFile(file);
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
