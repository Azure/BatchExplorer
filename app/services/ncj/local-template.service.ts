import { Injectable, OnDestroy } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";

export interface LocalTemplateFolder {
    path: string;
    alias: string;
}

export interface LocalTemplate {
    path: string;
    source: LocalTemplateFolder;
}

@Injectable()
export class LocalTemplateService implements OnDestroy {
    public templates: Observable<LocalTemplate[]>;
    public sources: Observable<LocalTemplateFolder[]>;

    private _templates = new BehaviorSubject<LocalTemplate[]>([]);
    private _sources = new BehaviorSubject<LocalTemplateFolder[]>([]);

    constructor() {
        this.templates = this._templates.asObservable();
        this.sources = this._sources.asObservable();
    }

    public init() {

    }

    public ngOnDestroy() {
        this._templates.complete();
        this._sources.complete();
    }

    private _loadSources() {

    }
}
