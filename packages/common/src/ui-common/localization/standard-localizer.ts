import { Localizer } from "./localizer";

interface Translations {
    [key: string]: string;
}

export class StandardLocalizer implements Localizer {
    private translations?: Translations;

    async loadTranslations(): Promise<void> {
        const language = navigator.language.split("-")[0];
        const response = await fetch(
            `./resources/translations/resources.${language}.json`
        );
        if (!response.ok) {
            throw new Error(
                `Failed to load translations: ${response.statusText}`
            );
        }
        this.translations = await response.json();
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
