import { Localizer } from "@batch/ui-common/lib/localization";
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
}
