import { Injectable, OnDestroy } from "@angular/core";
import { FileSystemService } from "@batch-flask/ui";
import { Constants } from "common";
import * as path from "path";
import { BehaviorSubject, Observable, from } from "rxjs";
import { flatMap, shareReplay, tap } from "rxjs/operators";
import { LocalFileStorage } from "../local-file-storage.service";

export interface LocalTemplateFolder {
    path: string;
    alias: string;
}

export interface LocalTemplate {
    path: string;
    source: LocalTemplateFolder;
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
        const array = await Promise.all(sources.map(x => this._findTemplatesInSource(x.path)));
        return array.flatten();
    }

    private async _findTemplatesInSource(folder: string): Promise<LocalTemplate[]> {
        const files = await this.fs.glob(path.join(folder, "**/*.{pool|job}.json"));

        const valid = [];
        console.log("File co", files.length);
        for (const file of files) {
            console.log("File", file);
            const template = this.fs.readFile(file);
            console.log("Template", template);
        }

        return valid;
    }
}
