import { Inject, Injectable, InjectionToken } from "@angular/core";

export const I18N_TRANSLATIONS = new InjectionToken("I18N_TRANSLATIONS");

@Injectable()
export class I18nService {
    private _translations = new Map<string, string>();

    constructor(@Inject(I18N_TRANSLATIONS) translations: Map<string, string>) {
        this._translations = translations;
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
