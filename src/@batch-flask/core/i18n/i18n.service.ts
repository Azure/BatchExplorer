import { Injectable, InjectionToken } from "@angular/core";
import { TranslationsLoaderService } from "@batch-flask/core/i18n/translations-loader.service";

export const I18N_TRANSLATIONS = new InjectionToken("I18N_TRANSLATIONS");

@Injectable()
export class I18nService {
    private _translations = new Map<string, string>();

    constructor(loader: TranslationsLoaderService) {
        this._translations = loader.translations;
        console.log("Trans", this._translations);
    }
    /**
     * Alias of #translate
     * @see #translate
     */
    public t(key: string) {
        return this.translate(key);
    }

    /**
     * Translate the given key
     * @param key
     */
    public translate(key: string) {
        return this._translations.get(key) || key;
    }
}
