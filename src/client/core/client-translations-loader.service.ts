import { Injectable } from "@angular/core";
import { Locale, LocaleService, TranslationsLoaderService } from "@batch-flask/core";
import { log } from "@batch-flask/utils";
import { Constants as ClientConstants } from "client/client-constants";
import { FileSystem } from "client/core";
import * as jsyaml from "js-yaml";
import * as path from "path";

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

    constructor(private fs: FileSystem, private localeService: LocaleService) {
        super();
    }

    public async load() {
        this.translations.clear();
        if (process.env.NODE_ENV === "production") {
            this._loadProductionTranslations();
        } else {
            this._loadDevelopementTranslations();
        }
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

    private async _loadDevelopementTranslations() {
        if (!translationFiles) {
            translationFiles = await this.fs.glob("**/*.i18n.yml");
        }
        await this._processFiles(translationFiles);

        const localeTranslationFile = path.join(ClientConstants.resourcesFolder, "./i18n/resources.fr.json");
        await this._loadProductionTranslationFile(localeTranslationFile);
    }

    private async _loadProductionTranslations() {
        const englishTranslationFile = path.join(ClientConstants.resourcesFolder, "./i18n/resources.en.json");
        await this._loadProductionTranslationFile(englishTranslationFile);
        await this._loadLocaleTranslations();
    }

    private async _loadLocaleTranslations() {
        const locale = this.localeService.locale;
        if (locale === Locale.EN) { return; }
        const localeTranslationFile = path.join(ClientConstants.resourcesFolder, `./i18n/resources.${locale}.json`);
        if (await this.fs.exists(localeTranslationFile)) {
            await this._loadProductionTranslationFile(localeTranslationFile);
        } else {
            log.warn(`Missing translation file for ${locale}. "${localeTranslationFile}" doesn't exists.`);
        }

    }

    private async _loadProductionTranslationFile(file: string) {
        const content = await this.fs.readFile(file);
        try {

            const translations = JSON.parse(content);
            for (const key of Object.keys(translations)) {
                this.translations.set(key, translationFiles[key]);
            }
        } catch (e) {
            log.error(`Failed to load translations file ${file}.`, e);
        }

    }
}
