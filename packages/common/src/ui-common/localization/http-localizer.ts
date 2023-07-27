import { Localizer } from "./localizer";

interface Translations {
    [key: string]: string;
}

export class HttpLocalizer implements Localizer {
    private translations?: Translations;

    async loadTranslations(): Promise<void> {
        const languageMap: Record<string, string> = {
            cs: "cs",
            de: "de",
            en: "en",
            es: "es",
            fr: "fr",
            hu: "hu",
            id: "id",
            it: "it",
            ja: "ja",
            ko: "ko",
            nl: "nl",
            pl: "pl",
            pt: "pt-PT",
            "pt-PT": "pt-PT",
            "pt-BR": "pt-BR",
            ru: "ru",
            sv: "sv",
            tr: "tr",
            zh: "zh-Hans",
            "zh-CN": "zh-Hans",
            "zh-TW": "zh-Hant",
        };

        let languageToLoad;

        if (languageMap[navigator.language]) {
            // Check for four-digit codes in the map first
            languageToLoad = languageMap[navigator.language];
        } else {
            // If not found, split and check for two-digit codes
            const language = navigator.language.split("-")[0];
            languageToLoad = languageMap[language]
                ? languageMap[language]
                : "en";
        }

        try {
            this.translations = await this.fetchTranslations(languageToLoad);
        } catch (error) {
            // Fall back to English if translations are not available for the selected locale
            if (languageToLoad !== "en") {
                console.error(
                    `Failed to load translations for '${languageToLoad}', falling back to English: ${
                        (error as Error).message
                    }`
                );
                languageToLoad = "en";
                this.translations = await this.fetchTranslations(
                    languageToLoad
                );
            } else {
                throw new Error(
                    `Failed to load translations for '${languageToLoad}': ${
                        (error as Error).message
                    }`
                );
            }
        }
    }

    private async fetchTranslations(lang: string): Promise<Translations> {
        const response = await fetch(`/resources/i18n/resources.${lang}.json`);

        if (!response.ok) {
            throw new Error(
                `Failed to load translations for '${lang}': ${response.statusText}`
            );
        }

        return await response.json();
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
