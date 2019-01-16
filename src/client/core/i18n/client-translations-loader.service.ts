import { Injectable } from "@angular/core";
import { DevTranslationsLoader } from "@batch-flask/compiler";
import { Locale, LocaleService, TranslationsLoaderService } from "@batch-flask/core";
import { FileSystemService } from "@batch-flask/electron";
import { log } from "@batch-flask/utils";
import { Constants as ClientConstants } from "client/client-constants";
import * as path from "path";

@Injectable()
export class ClientTranslationsLoaderService extends TranslationsLoaderService {
    /**
     * List of translation files
     */
    public translations = new Map<string, string>();

    constructor(
        private fs: FileSystemService,
        private localeService: LocaleService,
        private devTranslationsService: DevTranslationsLoader) {
        super();
    }

    public async load() {
        this.translations.clear();
        if (process.env.NODE_ENV === "production") {
            await this._loadProductionTranslations();
        } else {
            await this._loadDevelopementTranslations();
        }
    }

    public get serializedTranslations() {
        return JSON.stringify([...this.translations]);
    }

    private async _loadDevelopementTranslations() {
        this.translations = await this.devTranslationsService.load((key, source) => {
            log.error(`Translation with key ${key} already exists. ${source} is redefining it`);
        });
        await this._loadLocaleTranslations();
    }

    private async _loadProductionTranslations() {
        const englishTranslationFile = path.join(ClientConstants.resourcesFolder, "./i18n/resources.en.json");
        await this._loadProductionTranslationFile(englishTranslationFile);
        await this._loadLocaleTranslations();
    }

    /**
     * Laad the locale translation file if not english and merge with english translations
     */
    private async _loadLocaleTranslations() {
        const locale = this.localeService.locale;
        if (locale === Locale.English) { return; }
        const localeTranslationFile = path.join(ClientConstants.resourcesFolder, `./i18n/resources.${locale}.json`);
        if (await this.fs.exists(localeTranslationFile)) {
            await this._loadProductionTranslationFile(localeTranslationFile);
        } else {
            log.warn(`Missing translation file for ${locale}. "${localeTranslationFile}" doesn't exist.`);
        }

    }

    private async _loadProductionTranslationFile(file: string) {
        const content = await this.fs.readFile(file);
        try {
            const translations = JSON.parse(content);
            for (const key of Object.keys(translations)) {
                this.translations.set(key, translations[key]);
            }
        } catch (e) {
            log.error(`Failed to load translations file ${file}.`, e);
        }

    }
}
