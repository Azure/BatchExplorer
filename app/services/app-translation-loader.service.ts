import { Injectable } from "@angular/core";
import { TranslationsLoaderService } from "@batch-flask/core";
import { remote } from "electron";

@Injectable()
export class AppTranslationsLoaderService extends TranslationsLoaderService {
    public translations = new Map<string, string>();

    constructor() {
        super();
        const translations = (remote.getCurrentWindow() as any).translations;
        console.log("Here", translations);
        this.translations = new Map(JSON.parse(translations));
    }
}
