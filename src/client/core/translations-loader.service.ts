import { Injectable } from "@angular/core";
import { log } from "@batch-flask/utils";
import { FileSystem } from "client/core";
import * as jsyaml from "js-yaml";

@Injectable()
export class TranslationsLoaderService {
    public translations = new Map<string, string>();

    constructor(private fs: FileSystem) {

    }

    public async load() {
        const files = await this.fs.glob("**/*.i18n.yml");
        this._processFiles(files);
    }

    private async _processFiles(files: string[]) {
        return Promise.all(files.map(x => this._readTranslationFile(x)));
    }

    private async _readTranslationFile(path: string) {
        const content = await this.fs.readFile(path);
        this._mergeTranslations(jsyaml.load(content), path);
    }

    private _mergeTranslations(translations: StringMap<string>, source: string) {
        for (const key of Object.keys(translations)) {
            if (this.translations.has(key)) {
                log.error(`Translation with key ${key} already exists. ${source} is redefining it`);
            }
        }
    }
}
