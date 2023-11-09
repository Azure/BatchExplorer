import { app } from 'electron';
import { Localizer } from "@azure/bonito-core/lib/localization";
import { AppTranslationsLoaderService } from "app/services";

export class DesktopLocalizer implements Localizer {
    constructor(
      private translationsLoaderService: AppTranslationsLoaderService
    ) { }

    translate(message: string): string {
        const translations = this.translationsLoaderService.translations;
        if (!translations) {
            throw new Error("Translation strings are not loaded: " + message);
        }

        const translation = translations.get(message);

        if (translation != null) {
            return translation;
        } else {
            return message;
        }
    }

    getLocale(): string {
        if (process.type === 'renderer') {
            return navigator.language;
        } else {
            return app.getLocale();
        }
    }
}
