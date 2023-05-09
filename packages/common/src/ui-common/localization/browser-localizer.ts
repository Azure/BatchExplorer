import { Localizer } from "./localizer";

interface Translations {
    [key: string]: string;
}

export class BrowserLocalizer implements Localizer {
    private translations?: Translations;

    async loadTranslations(): Promise<void> {
        //zh-Hans is Chinese (Simplified) and zh-CN is the language code that modern browsers use for it
        //zh-Hant is Chinese (Traditional) and zh-TW is the language code that modern browsers use for it
        const hardcodedExceptions: Record<string, string> = {
            "zh-CN": "zh-Hans",
            "zh-TW": "zh-Hant",
        };
        const language =
            hardcodedExceptions[navigator.language] ||
            navigator.language.split("-")[0];

        try {
            this.translations = await this.fetchTranslations(language);
        } catch (error) {
            // if the two-digit code doesn't work, try the full language code
            try {
                this.translations = await this.fetchTranslations(
                    navigator.language
                );
            } catch (error) {
                try {
                    console.warn(
                        `Failed to load translations for both '${language}' and '${navigator.language}', falling back to English.`
                    );
                    this.translations = await this.fetchTranslations("en");
                } catch (error) {
                    if (error instanceof Error) {
                        throw new Error(
                            `Failed to load translations for '${language}', '${navigator.language}', and English: ${error.message}`
                        );
                    } else {
                        throw error;
                    }
                }
            }
        }
    }

    private async fetchTranslations(lang: string): Promise<Translations> {
        const response = await fetch(`./resources/i18n/resources.${lang}.json`);

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
