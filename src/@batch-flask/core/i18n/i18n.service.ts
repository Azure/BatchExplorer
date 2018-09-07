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
        if (!translations) { return this._noTranslation(key, params); }
        if (params) {
            return translations.format(params);
        } else {
            return translations;
        }
    }

    /**
     * Resolve the key. Try to use the namespace.key then key.
     * @param namespace
     * @param key
     */
    public resolveKey(namespace: string, key: string) {
        const namespacedKey = `${namespace}.${key}`;
        if (this._translations.has(namespacedKey)) {
            return namespacedKey;
        } else {
            return key;
        }
    }

    private _noTranslation(key: string, params: StringMap<string> | null) {
        if (params) {
            const prettyParams = Object.entries(params).map(([k, v]) => `${k}:${v}`).join(", ");
            return `${key}(${prettyParams})`;
        } else {
            return key;
        }
    }
}
