import { replaceTokens } from "./localization-util";
import { Localizer, LocalizerTokenMap } from "./localizer";

export class FakeLocalizer implements Localizer {
    private locale: string;

    constructor() {
        this.locale = "en";
    }

    translate(message: string, tokens?: LocalizerTokenMap): string {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const value = (globalThis as unknown as any).__TEST_RESOURCE_STRINGS[
            message
        ];
        if (value == null) {
            throw new Error("Unable to translate string " + message);
        }
        if (tokens) {
            return replaceTokens(value, tokens);
        }
        return value;
    }

    getLocale(): string {
        return this.locale;
    }

    setLocale(locale: string): void {
        this.locale = locale;
    }
}
