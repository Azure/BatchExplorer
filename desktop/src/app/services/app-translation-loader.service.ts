import { Injectable } from "@angular/core";
import { TranslationsLoaderService } from "@batch-flask/core";
import { remote } from "electron";

@Injectable({providedIn: "root"})
export class AppTranslationsLoaderService extends TranslationsLoaderService {
    public translations = new Map<string, string>();

    constructor() {
        super();
        const translationsLoader = (remote.getCurrentWindow() as any).translationsLoader;
        this.translations = new Map(JSON.parse(translationsLoader.serializedTranslations));
    }
}
