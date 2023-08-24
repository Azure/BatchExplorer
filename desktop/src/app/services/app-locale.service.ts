import { Injectable } from "@angular/core";
import { Locale, LocaleService } from "@batch-flask/core";
import { getCurrentWindow } from "@electron/remote";

@Injectable({providedIn: "root"})
export class AppLocaleService extends LocaleService {
    private _clientLocaleService: LocaleService;

    constructor() {
        super();
        this._clientLocaleService = (getCurrentWindow() as any).localeService;
        this.locale = this._clientLocaleService.locale;
    }

    public load(): Promise<any> {
        return Promise.resolve();
    }

    public async setLocale(locale: Locale) {
        this.locale = locale;
        await this._clientLocaleService.setLocale(locale);
    }
}
