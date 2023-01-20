import { Injectable } from "@angular/core";

export enum Locale {
    Czech = "cs",
    German = "de",
    English = "en",
    Spanish = "es",
    French = "fr",
    Hungarian = "hu",
    Italian = "it",
    Japanese = "ja",
    Korean = "ko",
    Dutch = "nl",
    Polish = "pl",
    BrazilianPortuguese = "pt-BR",
    Portuguese = "pt",
    Russian = "ru",
    Swedish = "sv",
    Turkish = "tr",
    ChineseSimplified = "zh-Hans",
    ChineseTraditional = "zh-Hant",
}

// eslint-disable-next-line @typescript-eslint/naming-convention,no-underscore-dangle,id-blacklist,id-match
export const TranslatedLocales = {
    [Locale.Czech]: "Čeština‎",
    [Locale.German]: "Deutsch",
    [Locale.English]: "English",
    [Locale.Spanish]: "Español‎",
    [Locale.French]: "Français‎",
    [Locale.Hungarian]: "Magyar‎",
    [Locale.Italian]: "Italiano",
    [Locale.Japanese]: "日本語‎",
    [Locale.Korean]: "한국어‎",
    [Locale.Dutch]: "Nederlands",
    [Locale.Polish]: "Polski",
    [Locale.BrazilianPortuguese]: "Português (Brasil)‎",
    [Locale.Portuguese]: "Português",
    [Locale.Russian]: "Русский‎",
    [Locale.Swedish]: "Svenska‎",
    [Locale.Turkish]: "Türkçe‎",
    [Locale.ChineseSimplified]: "中文(简体)‎",
    [Locale.ChineseTraditional]: "中文(繁體)‎",
};

@Injectable({providedIn: "root"})
export abstract class LocaleService {
    public locale: Locale;

    public abstract load(): Promise<any>;
    public abstract setLocale(locale: Locale): Promise<any>;
}
