import { Injectable } from "@angular/core";
import { Locale, LocaleService } from "@batch-flask/core";
import { log } from "@batch-flask/utils";
import * as path from "path";
import { FileSystem } from "./fs";

@Injectable()
export class ClientLocaleService extends LocaleService {
    public locale: Locale;

    constructor(private fs: FileSystem) {
        super();
    }

    public async load() {
        const localeFile = path.join(this.fs.commonFolders.appData, "locale.json");
        try {

            if (await this.fs.exists(localeFile)) {
                const definition = JSON.parse(await this.fs.readFile(localeFile));
                const locale = definition.locale;

                if (locale && locale in Object.values(Locale)) {
                    return locale;
                } else {
                    log.warn("locale configuration file is invalid");
                }
            }
        } catch (e) {
            log.error("Fail to load local files. Will default to english", e);
        }

        return Locale.EN;
    }

    public async setLocale(locale: Locale) {

    }
}
