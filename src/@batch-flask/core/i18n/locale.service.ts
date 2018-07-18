import { Inject, Injectable, InjectionToken } from "@angular/core";

export const I18N_LOCALE = new InjectionToken("I18N_LOCALE");

export enum Locale {
    EN = "en",
    FR = "fr",
}

@Injectable()
export class LocaleService {
    public currentLocale: Locale;

    constructor(@Inject(I18N_LOCALE) locale: Locale) {
        this.currentLocale = locale;
    }
}
