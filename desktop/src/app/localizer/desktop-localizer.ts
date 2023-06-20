import { Localizer } from "@batch/ui-common/lib/localization";
import * as path from 'path';
import { ipcRenderer } from "electron";
import * as fs from 'fs';
import { AppLocaleService } from "app/services";

interface Translations {
    [key: string]: string;
}

export class DesktopLocalizer implements Localizer {
    private translations?: Translations;

    constructor(private localeService: AppLocaleService) { }

    async loadTranslations(): Promise<void> {
        const locale = this.localeService.locale;
        const appPath = await ipcRenderer.invoke('get-app-path');
        let translationFilePath = path.resolve(appPath, `../../../desktop/resources/i18n/resources.${locale}.json`);

        try {
            // Load translations from disk
            const data = await fs.promises.readFile(translationFilePath, 'utf8');
            this.translations = JSON.parse(data);
        } catch (error) {
            console.warn(`Error loading translations for ${locale}: `, error);

            // If the requested locale isn't available, default to English
            if (locale !== 'en') {
                console.warn("Defaulting to English translations");
                translationFilePath = path.resolve(appPath, '../../../desktop/resources/i18n/resources.en.json');
                const defaultData = await fs.promises.readFile(translationFilePath, 'utf8');
                this.translations = JSON.parse(defaultData);
            } else {
                throw new Error(`Failed to load translations: ${error}`);
            }
        }
    }

    translate(message: string): string {
        if (!this.translations) {
            throw new Error("Translation strings are not loaded " + message);
        }
        const translation = this.translations[message];
        if (translation != null) {
            return translation;
        } else {
            return message;
        }
    }
}
