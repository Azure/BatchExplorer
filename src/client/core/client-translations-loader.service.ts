import { Injectable } from "@angular/core";
import { TranslationsLoaderService } from "@batch-flask/core";
import { log } from "@batch-flask/utils";
import { FileSystem } from "client/core";
import * as jsyaml from "js-yaml";

const translations = new Map<string, string>();
let translationFiles;

@Injectable()
export class ClientTranslationsLoaderService extends TranslationsLoaderService {
    /**
     * List of translation files
     */
    public get translations() {
        return translations;
    }

    constructor(private fs: FileSystem) {
        super();
    }

    public async load() {
        console.time("Glob");
        this.translations.clear();
        if (!translationFiles) {
            translationFiles = await this.fs.glob("**/*.i18n.yml");
        }
        console.timeEnd("Glob");
        console.time("ProcessF");
        await this._processFiles(translationFiles);
        console.timeEnd("ProcessF");
    }

    public get serializedTranslations() {
        return JSON.stringify([...this.translations]);
    }

    private async _processFiles(files: string[]) {
        return Promise.all(files.map(x => this._readTranslationFile(x)));
    }

    private async _readTranslationFile(path: string) {
        const content = await this.fs.readFile(path);
        this._mergeTranslations(this._flatten(jsyaml.load(content)), path);
    }

    private _flatten(translations: StringMap<any>): StringMap<string> {
        const output = {};

        function step(object, prev = null, currentDepth = 0) {
            currentDepth = currentDepth || 1;
            for (const key of Object.keys(object)) {
                const value = object[key];
                const isString = typeof value === "string";

                const newKey = prev
                    ? prev + "." + key
                    : key;

                if (!isString && Object.keys(value).length) {
                    return step(value, newKey, currentDepth + 1);
                }

                output[newKey] = value;
            }
        }

        step(translations);

        return output;
    }

    private _mergeTranslations(translations: StringMap<any>, source: string) {
        if (process.env.NODE_ENV !== "production") {
            for (const key of Object.keys(translations)) {
                if (this.translations.has(key)) {
                    log.error(`Translation with key ${key} already exists. ${source} is redefining it`);
                }
            }
        }

        for (const key of Object.keys(translations)) {
            this.translations.set(key, translations[key]);
        }
    }
}
