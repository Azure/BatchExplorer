import { Injectable } from "@angular/core";

export enum Locale {
    EN = "en",
    FR = "fr",
}

@Injectable()
export abstract class LocaleService {
    public locale: Locale;

    public abstract load(): Promise<any>;
    public abstract setLocale(locale: Locale): Promise<any>;
}
