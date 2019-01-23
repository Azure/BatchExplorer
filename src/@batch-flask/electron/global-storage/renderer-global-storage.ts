import { Injectable, NgZone } from "@angular/core";
import { GlobalStorage } from "@batch-flask/core";
import { Observable } from "rxjs";
import { SharedServiceInjector } from "../shared-service-injector";
import { wrapMainObservable } from "../utils";
import { GLOBAL_STORAGE } from "./key";

@Injectable()
export class RendererGlobalStorage extends GlobalStorage {
    public _mainService: GlobalStorage;

    constructor(injector: SharedServiceInjector, private zone: NgZone) {
        super();
        this._mainService = injector.get(GLOBAL_STORAGE);
    }

    public watchContent(key: string): Observable<string | null> {
        return wrapMainObservable<string | null>(this._mainService.watchContent(key), this.zone);
    }

    public async save(key: string, content: string): Promise<void> {
        this._mainService.save(key, content);
    }
}
