import { Injectable } from "@angular/core";
import { Locale, LocaleService } from "@batch-flask/core";
import { log } from "@batch-flask/utils";
import * as path from "path";
import { FileSystem } from "./fs";

@Injectable()
export class ClientLocaleService extends LocaleService {
    public locale: Locale = Locale.EN;

    constructor(private fs: FileSystem) {
        super();
    }

    public async load(): Promise<Locale> {
        this.locale = await this._loadLocale();
        return this.locale;
    }

    public async setLocale(locale: Locale) {
        const localeFile = this._localeFile;
        const content = JSON.stringify({ locale: this.locale });
        await this.fs.saveFile(localeFile, content);
    }

    private get _localeFile() {
        return path.join(this.fs.commonFolders.userData, "locale.json");
    }

    private async _loadLocale(): Promise<Locale> {
        const localeFile = this._localeFile;
        try {

            if (await this.fs.exists(localeFile)) {
                const definition = JSON.parse(await this.fs.readFile(localeFile));
                const locale = definition.locale;

                if (locale) {
                    const availableLocales = Object.values(Locale);
                    if (availableLocales.includes(locale)) {
                        return locale;
                    } else {
                        log.warn(`Locale configuration file is invalid. Unknown locale ${locale}. `
                            + `Use one of ${availableLocales}`);
                    }
                }
            }
        } catch (e) {
            log.error("Fail to load local files. Will default to english", e);
        }

        return Locale.EN;
    }
}
