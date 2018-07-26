import { Injectable } from "@angular/core";
import { TranslationsLoaderService } from "@batch-flask/core/i18n/translations-loader.service";

@Injectable()
export class I18nService {
    private _translations = new Map<string, string>();

    constructor(loader: TranslationsLoaderService) {
        this._translations = loader.translations;
    }
    /**
     * Alias of #translate
     * @see #translate
     */
    public t(key: string, params?: StringMap<any>) {
        return this.translate(key, params);
    }

    /**
     * Translate the given key
     * @param key
     */
    public translate(key: string, params?: StringMap<any>) {
        const translations = this._translations.get(key);
        if (!translations) { return key; }
        if (params) {
            return translations.format(params);
        } else {
            return translations;
        }
    }
}
